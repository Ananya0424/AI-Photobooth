const { Resend } = require("resend");
const axios = require("axios");

/**
 * Email Service — Resend API (RECOMMENDED FOR RENDER)
 *
 * Why Resend instead of Gmail SMTP on Render?
 *   - No IP reputation issues (dedicated email infrastructure)
 *   - Simpler API (no SMTP pool config needed)
 *   - Built for transactional emails from apps
 *   - Free tier: 100 emails/day
 *   - After free tier: $0.0001/email
 *
 * Setup:
 *   1. Sign up at https://resend.com
 *   2. Create API key
 *   3. Verify sender domain (or use default no-reply@resend.dev)
 *   4. Set RESEND_API_KEY in Render environment variables
 *   5. Update server.js to use this service instead of Gmail
 */

let _resendClient = null;

const getResendClient = () => {
  if (_resendClient) return _resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  _resendClient = new Resend(apiKey);
  return _resendClient;
};

/**
 * Download image buffer from URL
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
 * Escape HTML to prevent XSS
 */
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Build email template
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

/**
 * Prepare image attachment
 */
const prepareImageAttachment = async (imageUrl, userName) => {
  const safeName = encodeURIComponent(userName).slice(0, 40);
  const ts = Date.now();

  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 data URI format");

    const contentType = match[1];
    const content = Buffer.from(match[2], "base64");
    const ext = contentType.split("/")[1] || "jpg";

    return { 
      content, 
      contentType, 
      filename: `ai-portrait-${safeName}-${ts}.${ext}` 
    };
  }

  // External URL
  let contentType = "image/jpeg";
  let ext = "jpg";

  if (imageUrl.includes(".png")) { contentType = "image/png"; ext = "png"; }
  if (imageUrl.includes(".webp")) { contentType = "image/webp"; ext = "webp"; }

  const content = await downloadImageBuffer(imageUrl);
  return { 
    content, 
    contentType, 
    filename: `ai-portrait-${safeName}-${ts}.${ext}` 
  };
};

/**
 * Send portrait email via Resend (non-blocking, fire-and-forget)
 * 
 * @param {string} toEmail Recipient email
 * @param {string} userName User's name
 * @param {string} imageUrl Portrait image URL or data URI
 * @returns {Promise<{success:boolean, queued?:boolean, messageId?:string, error?:string, mock?:boolean}>}
 */
const sendPortraitEmailResend = async (toEmail, userName, imageUrl) => {
  const logPrefix = `[EmailService:Resend] ${toEmail}`;

  try {
    const resend = getResendClient();

    if (!resend) {
      console.log(`${logPrefix} Resend API key not configured — skipping.`);
      return { 
        success: false, 
        error: "Resend API key not configured", 
        mock: true 
      };
    }

    console.log(`${logPrefix} Preparing attachment...`);

    let attachment;
    try {
      attachment = await prepareImageAttachment(imageUrl, userName);
    } catch (imgErr) {
      console.warn(`${logPrefix} Image preparation failed: ${imgErr.message}`);
      return { 
        success: false, 
        error: `Image preparation failed: ${imgErr.message}` 
      };
    }

    console.log(`${logPrefix} Sending via Resend API...`);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AI Photo Booth <onboarding@resend.dev>",
      to: toEmail,
      subject: `Your AI Portrait is Ready, ${escapeHtml(userName)}! 📸`,
      html: buildEmailTemplate(userName),
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        },
      ],
    });

    if (result.error) {
      console.error(`${logPrefix} Resend API error: ${result.error.message}`);
      return { 
        success: false, 
        error: `Resend API error: ${result.error.message}` 
      };
    }

    console.log(`${logPrefix} Email queued. messageId=${result.data.id}`);
    return { 
      success: true, 
      queued: true, 
      messageId: result.data.id 
    };

  } catch (err) {
    console.error(`${logPrefix} Unexpected error: ${err.message}`);
    return { 
      success: false, 
      error: err.message 
    };
  }
};

/**
 * Send portrait email via Resend (with confirmation)
 * 
 * Use this only when you need delivery confirmation.
 * For most cases, use the non-blocking variant above.
 */
const sendPortraitEmailResendAsync = async (toEmail, userName, imageUrl) => {
  const logPrefix = `[EmailService:Resend:async] ${toEmail}`;

  try {
    const resend = getResendClient();

    if (!resend) {
      console.log(`${logPrefix} Resend API key not configured.`);
      return { 
        success: false, 
        error: "Resend API key not configured" 
      };
    }

    // Prepare attachment with timeout
    const attachment = await Promise.race([
      prepareImageAttachment(imageUrl, userName),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image preparation timeout (10s)")), 10_000)
      ),
    ]);

    // Send with timeout
    const result = await Promise.race([
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "AI Photo Booth <onboarding@resend.dev>",
        to: toEmail,
        subject: `Your AI Portrait is Ready, ${escapeHtml(userName)}! 📸`,
        html: buildEmailTemplate(userName),
        attachments: [
          {
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          },
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Resend API timeout (15s)")), 15_000)
      ),
    ]);

    if (result.error) {
      console.error(`${logPrefix} Failed: ${result.error.message}`);
      return { 
        success: false, 
        error: result.error.message 
      };
    }

    console.log(`${logPrefix} Delivered. messageId=${result.data.id}`);
    return { 
      success: true, 
      messageId: result.data.id 
    };

  } catch (err) {
    console.error(`${logPrefix} Error: ${err.message}`);
    return { 
      success: false, 
      error: err.message 
    };
  }
};

/**
 * Health check for Resend service
 */
const checkResendHealth = async () => {
  const resend = getResendClient();

  if (!resend) {
    return {
      healthy: true,
      configured: false,
      message: "Resend API not configured (optional)",
    };
  }

  try {
    // Resend doesn't have a direct health check, but we can check the API key
    const test = await Promise.race([
      // Try to get email list (lightweight check)
      resend.emails.list().catch(() => ({ data: [] })),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Resend API timeout")), 5_000)
      ),
    ]);

    return {
      healthy: true,
      configured: true,
      message: "Resend API healthy",
    };
  } catch (err) {
    return {
      healthy: false,
      configured: true,
      message: `Resend API error: ${err.message}`,
    };
  }
};

module.exports = {
  sendPortraitEmailResend,
  sendPortraitEmailResendAsync,
  checkResendHealth,
  getResendClient,
};