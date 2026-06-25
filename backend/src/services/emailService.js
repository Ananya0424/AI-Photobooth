const nodemailer = require("nodemailer");
const axios      = require("axios");

/**
 * Email Service (Gmail SMTP) — UPDATED FOR RENDER
 *
 * FIXES in this version:
 *   - Pool error handler added: dead/dropped SMTP connections now reset the
 *     singleton so the next request gets a fresh transporter (was silently
 *     failing forever on Render after a connection drop)
 *   - SMTP verify timeout increased from 5s to 15s for Render network latency
 *   - Callback errors logged with full context
 *   - Fire-and-forget remains non-blocking
 */

// ─── Singleton transporter ────────────────────────────────────────────────────

let _transporter      = null;
let _transporterReady = false;

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

  const transporter = nodemailer.createTransport({
    pool:           true,
    maxConnections: 5,
    maxMessages:    100,
    host:           "smtp.gmail.com",
    port:           587,
    secure:         false, // STARTTLS
    requireTLS:     true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 10_000,
    socketTimeout:     15_000,
    logger: false,
    debug:  process.env.NODE_ENV !== "production",
  });

  // FIXED: listen for pool-level errors and reset the singleton so the next
  // request creates a fresh transporter instead of reusing a dead connection.
  transporter.on("error", (err) => {
    console.error(
      `[EmailService] SMTP pool error — resetting transporter: ${err.message}`
    );
    _transporter      = null;
    _transporterReady = false;
  });

  return transporter;
};

/**
 * Returns the cached transporter, creating it on first call.
 * Safe to call multiple times. If a previous transporter died and was reset,
 * this will create a new one transparently.
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
 */
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");

/**
 * Download an image from a URL with retry + exponential backoff.
 */
const downloadImageBuffer = async (url, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout:      8_000,
      });
      return Buffer.from(response.data, "binary");
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
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
 * NOTE: Does NOT rely on URL extension for content-type detection (Cloudinary
 * may serve WebP via fetch_format:auto even for .png URLs).
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

  // External URL — download and detect type from response headers, not URL path
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout:      8_000,
  });
  const content     = Buffer.from(response.data, "binary");
  const contentType = response.headers["content-type"]?.split(";")[0] || "image/jpeg";
  const ext         = contentType.split("/")[1] || "jpg";

  return { content, contentType, filename: `ai-portrait-${safeName}-${ts}.${ext}` };
};

// ─── Email template ───────────────────────────────────────────────────────────

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
 * Send a portrait email NON-BLOCKING (fire-and-forget).
 * API response is not held waiting for SMTP delivery.
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

    transporter.sendMail(mailOptions, (err, info) => {
      const timestamp = new Date().toISOString();
      if (err) {
        console.error(`${logPrefix} [${timestamp}] DELIVERY FAILED:`);
        console.error(`  Error message: ${err.message}`);
        console.error(`  Error code: ${err.code || "N/A"}`);
        console.error(`  Response: ${err.response || "N/A"}`);
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
 * Use only when delivery confirmation is required before continuing.
 */
const sendPortraitEmailAsync = async (toEmail, userName, imageUrl) => {
  const logPrefix = `[EmailService:async] ${toEmail}`;

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`${logPrefix} Email not configured — skipping.`);
      return { success: false, error: "Email service not configured" };
    }

    const attachment = await Promise.race([
      prepareImageAttachment(imageUrl, userName),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image preparation timeout (10s)")), 10_000)
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

    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP send timeout (15s)")), 15_000)
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
 * Timeout increased to 15s for Render network latency.
 */
const checkEmailServiceHealth = async () => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      healthy:    true,
      configured: false,
      message:    "Email service not configured (optional)",
    };
  }

  try {
    const VERIFY_TIMEOUT = process.env.NODE_ENV === "production" ? 15_000 : 5_000;

    const ok = await Promise.race([
      new Promise((resolve) =>
        transporter.verify((err) => {
          console.log(
            `[Email Health] SMTP verify result:`,
            !err ? "OK" : err.message
          );
          resolve(!err);
        })
      ),
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
        : "SMTP verification timed out (Render limitation; emails still queued)",
    };
  } catch (err) {
    return {
      healthy:    false,
      configured: true,
      message:    `Email service error: ${err.message}`,
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