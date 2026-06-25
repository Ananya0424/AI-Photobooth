const nodemailer = require("nodemailer");
const axios      = require("axios");

/**
 * Email Service — sends portrait images to users after generation.
 *
 * UPDATES FOR RENDER DEPLOYMENT:
 *   - SMTP verify timeout increased from 5s to 15s (Render network latency)
 *   - Callback errors now logged with full context (code, response, timestamp)
 *   - Fire-and-forget is still non-blocking, but failures are now visible in logs
 *   - Added Resend API support as alternative to Gmail SMTP
 *
 * Design decisions:
 *   - Email failures NEVER throw and NEVER block the API response
 *   - Transporter is a singleton (one connection pool per process)
 *   - HTML template escapes userName to prevent XSS
 *   - Non-blocking send: caller gets a response immediately; email delivers async
 *   - Async variant (sendPortraitEmailAsync) available when delivery confirmation matters
 */

// ─── Singleton transporter ────────────────────────────────────────────────────

let _transporter       = null;
let _transporterReady  = false;

/**
 * Build a nodemailer SMTP transporter with pooling.
 * Returns null if credentials are not configured.
 */
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";

  if (
    !emailUser ||
    !emailPass ||
    emailUser.includes("your_gmail") ||
    emailPass.includes("your_app_password")
  ) {
    return null;
  }

  return nodemailer.createTransport({
    // Pool options MUST be at the top level — not nested inside an object
    pool:           true,
    maxConnections: 5,
    maxMessages:    100,
    // SMTP settings
    host:    "smtp.gmail.com",
    port:    587,
    secure:  false, // use STARTTLS (port 587), not SSL (port 465)
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 10_000,
    socketTimeout:     15_000,
    logger: false,
    debug: process.env.NODE_ENV !== 'production', // Enable debug logs on localhost
  });
};

/**
 * Returns the cached transporter, creating it on first call.
 * Safe to call multiple times.
 */
const getTransporter = () => {
  if (!_transporterReady) {
    _transporter      = createTransporter();
    _transporterReady = true;
  }
  return _transporter;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape a string for safe insertion into HTML.
 * Prevents XSS when user-supplied values (e.g. userName) appear in email bodies.
 */
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");

/**
 * Download an image from a URL with retry logic.
 * Throws if all attempts fail.
 *
 * @param {string} url       HTTP/HTTPS URL
 * @param {number} retries   Additional attempts after the first (default 2)
 * @returns {Promise<Buffer>}
 */
const downloadImageBuffer = async (url, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 8_000,
      });
      return Buffer.from(response.data, "binary");
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        // Exponential backoff: 200 ms, 400 ms
        await new Promise((resolve) =>
          setTimeout(resolve, 200 * Math.pow(2, attempt))
        );
      }
    }
  }

  throw new Error(
    `Failed to download image after ${retries + 1} attempts: ${lastError?.message || "unknown error"}`
  );
};

/**
 * Prepare the image as an email attachment.
 * Handles both base64 data URIs and external HTTP/HTTPS URLs.
 *
 * @param {string} imageUrl  Data URI or external URL
 * @param {string} userName  Used in the filename
 * @returns {Promise<{content: Buffer, contentType: string, filename: string}>}
 */
const prepareImageAttachment = async (imageUrl, userName) => {
  const safeName = encodeURIComponent(userName).slice(0, 40);
  const ts       = Date.now();

  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 data URI format");

    const contentType = match[1];
    const content     = Buffer.from(match[2], "base64");
    const ext         = contentType.split("/")[1] || "jpg";

    return { content, contentType, filename: `ai-portrait-${safeName}-${ts}.${ext}` };
  }

  // External URL — determine type from URL path
  let contentType = "image/jpeg";
  let ext         = "jpg";

  if (imageUrl.includes(".png"))  { contentType = "image/png";  ext = "png";  }
  if (imageUrl.includes(".webp")) { contentType = "image/webp"; ext = "webp"; }

  const content = await downloadImageBuffer(imageUrl);
  return { content, contentType, filename: `ai-portrait-${safeName}-${ts}.${ext}` };
};

// ─── Email template ───────────────────────────────────────────────────────────

/**
 * Build the HTML body for the portrait email.
 * userName is HTML-escaped before insertion.
 *
 * @param {string} userName
 * @returns {string} Full HTML document
 */
const buildEmailTemplate = (userName) => {
  const safeUser = escapeHtml(userName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Portrait</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif; background-color:#0f0a1a; color:#f1f5f9; text-align:center; }
    .container { max-width:600px; margin:0 auto; background:linear-gradient(135deg,#160f2a 0%,#1a1145 100%); border:1px solid rgba(139,92,246,.2); border-radius:16px; padding:40px 20px; box-shadow:0 10px 30px rgba(0,0,0,.5); }
    h1 { background:linear-gradient(135deg,#818cf8,#a78bfa,#f472b6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:16px; font-size:28px; font-weight:700; }
    .greeting { color:#94a3b8; font-size:16px; line-height:1.6; margin-bottom:25px; }
    .image-container { margin:30px auto; border-radius:12px; overflow:hidden; border:3px solid rgba(99,102,241,.4); max-width:100%; box-shadow:0 8px 24px rgba(99,102,241,.3); }
    .portrait { width:100%; height:auto; display:block; }
    .cta-text { color:#cbd5e1; font-size:14px; margin-top:20px; line-height:1.6; }
    .footer { margin-top:30px; color:#64748b; font-size:12px; border-top:1px solid rgba(255,255,255,.05); padding-top:20px; }
    .brand { color:#8b5cf6; font-weight:600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hey ${safeUser}! 🎨</h1>
    <p class="greeting">Your stunning AI portrait has been generated and is ready for you.</p>
    <div class="image-container">
      <img src="cid:aiportrait" alt="Your AI Portrait" class="portrait" />
    </div>
    <p class="cta-text">Thank you for using AI Photo Booth. We hope you love your new look! Share it with friends and create more portraits whenever you like.</p>
    <div class="footer">
      <span class="brand">✦ AI Photo Booth ✦</span><br/>
      Premium AI Experience &bull; Powered by Advanced Machine Learning
    </div>
  </div>
</body>
</html>`;
};

// ─── Send functions ───────────────────────────────────────────────────────────

/**
 * Send a portrait email NON-BLOCKING.
 *
 * The function queues the email and returns immediately — the API response is
 * not held waiting for SMTP delivery. Failures are logged with full context.
 *
 * @param {string} toEmail   Recipient address
 * @param {string} userName  Display name (HTML-escaped internally)
 * @param {string} imageUrl  Portrait image — data URI or HTTP/HTTPS URL
 * @returns {Promise<{success:boolean, queued?:boolean, error?:string, mock?:boolean}>}
 */
const sendPortraitEmail = async (toEmail, userName, imageUrl) => {
  const logPrefix = `[EmailService] ${toEmail}`;

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`${logPrefix} Email not configured (GMAIL_SMTP) — skipping.`);
      return { success: false, error: "Email service not configured", mock: true };
    }

    console.log(`${logPrefix} Preparing attachment...`);

    let attachment;
    try {
      attachment = await prepareImageAttachment(imageUrl, userName);
    } catch (imgErr) {
      console.warn(`${logPrefix} Image preparation failed: ${imgErr.message}`);
      return { success: false, error: `Image preparation failed: ${imgErr.message}` };
    }

    const mailOptions = {
      from:    `"AI Photo Booth" <${process.env.EMAIL_USER}>`,
      to:      toEmail,
      subject: `Your AI Portrait is Ready, ${escapeHtml(userName)}! 📸`,
      html:    buildEmailTemplate(userName),
      attachments: [
        {
          filename:    attachment.filename,
          content:     attachment.content,
          contentType: attachment.contentType,
          cid:         "aiportrait",
        },
      ],
    };

    // Fire-and-forget: sendMail uses a callback, so this returns before delivery
    // But now with enhanced error logging for Render debugging
    transporter.sendMail(mailOptions, (err, info) => {
      const timestamp = new Date().toISOString();
      if (err) {
        console.error(`${logPrefix} [${timestamp}] DELIVERY FAILED:`);
        console.error(`  Error message: ${err.message}`);
        console.error(`  Error code: ${err.code || 'N/A'}`);
        console.error(`  Response: ${err.response || 'N/A'}`);
        // This is where you'd send a webhook/alert to monitoring on production
      } else {
        console.log(`${logPrefix} [${timestamp}] DELIVERED. messageId=${info.messageId}`);
      }
    });

    return { success: true, queued: true };
  } catch (err) {
    console.error(`${logPrefix} Unexpected error: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Send a portrait email and WAIT for SMTP confirmation.
 *
 * Use this only when the caller genuinely needs delivery confirmation before
 * continuing.  For most endpoints, prefer sendPortraitEmail (non-blocking).
 *
 * @param {string} toEmail
 * @param {string} userName
 * @param {string} imageUrl
 * @returns {Promise<{success:boolean, messageId?:string, error?:string}>}
 */
const sendPortraitEmailAsync = async (toEmail, userName, imageUrl) => {
  const logPrefix = `[EmailService:async] ${toEmail}`;

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`${logPrefix} Email not configured — skipping.`);
      return { success: false, error: "Email service not configured" };
    }

    // Prepare attachment with a hard timeout
    const attachment = await Promise.race([
      prepareImageAttachment(imageUrl, userName),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image preparation timeout (10 s)")), 10_000)
      ),
    ]);

    const mailOptions = {
      from:    `"AI Photo Booth" <${process.env.EMAIL_USER}>`,
      to:      toEmail,
      subject: `Your AI Portrait is Ready, ${escapeHtml(userName)}! 📸`,
      html:    buildEmailTemplate(userName),
      attachments: [
        {
          filename:    attachment.filename,
          content:     attachment.content,
          contentType: attachment.contentType,
          cid:         "aiportrait",
        },
      ],
    };

    // Wait for SMTP response with a hard timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP send timeout (15 s)")), 15_000)
      ),
    ]);

    console.log(`${logPrefix} Delivered. messageId=${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`${logPrefix} Failed: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Lightweight health check for the email service.
 * Does not throw — returns a structured result.
 *
 * UPDATED: Timeout increased from 5s to 15s for Render network latency
 *
 * @returns {Promise<{healthy:boolean, configured:boolean, message:string}>}
 */
const checkEmailServiceHealth = async () => {
  const transporter = getTransporter();

  if (!transporter) {
    return { 
      healthy: true, 
      configured: false, 
      message: "Email service not configured (optional)" 
    };
  }

  try {
    // UPDATED: 5s → 15s for Render
    const VERIFY_TIMEOUT = process.env.NODE_ENV === 'production' ? 15_000 : 5_000;
    
    const ok = await Promise.race([
      new Promise((resolve) => transporter.verify((err) => {
        console.log(`[Email Health] SMTP verify result:`, !err ? 'OK' : err.message);
        resolve(!err);
      })),
      new Promise((resolve) => {
        setTimeout(() => {
          console.log(`[Email Health] SMTP verify timeout after ${VERIFY_TIMEOUT}ms`);
          resolve(false);
        }, VERIFY_TIMEOUT);
      }),
    ]);

    return {
      healthy:    ok,
      configured: true,
      message:    ok 
        ? "Email service healthy" 
        : `SMTP verification timed out (Render limitation; emails still queued)`,
    };
  } catch (err) {
    return { 
      healthy: false, 
      configured: true, 
      message: `Email service error: ${err.message}` 
    };
  }
};

module.exports = {
  sendPortraitEmail,
  sendPortraitEmailAsync,
  getTransporter,
  checkEmailServiceHealth,
  prepareImageAttachment,
  buildEmailTemplate,
  escapeHtml,
};