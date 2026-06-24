const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Production-safe email service for sending portrait emails.
 * 
 * Key design decisions:
 * 1. Email failures do NOT throw - they log and resolve gracefully
 * 2. No SMTP verification - avoids connection timeout blocking
 * 3. Non-blocking: email sends in background, share endpoint responds immediately
 * 4. Structured responses for logging and monitoring
 * 5. Render-compatible configuration with explicit SMTP settings
 */

// Cache transporter instance (lazy-loaded)
let cachedTransporter = null;
let transporterInitialized = false;

/**
 * Creates nodemailer transporter with Render-safe configuration
 * No verification - avoids timeout blocking
 * @returns {Object|null} Transporter instance or null if credentials missing
 */
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Validate credentials exist and aren't placeholders
  if (!emailUser || !emailPass) {
    return null;
  }

  if (emailUser.includes("your_gmail") || emailPass.includes("your_app_password")) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS, not TLS on port 465
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Render timeout configuration - adjusted for slower networks
    connectionTimeout: 10000,
    socketTimeout: 15000,
    // CRITICAL: Do NOT verify() - causes blocking connection timeout
    pool: {
      maxConnections: 5,
      maxMessages: 100,
    },
  });
};

/**
 * Gets or creates cached transporter
 * Avoids recreating transporter on every email
 * @returns {Object|null}
 */
const getTransporter = () => {
  if (!transporterInitialized) {
    cachedTransporter = createTransporter();
    transporterInitialized = true;
  }
  return cachedTransporter;
};

/**
 * Downloads image from URL with retry logic
 * @param {string} url - HTTP/HTTPS URL or data URI
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Buffer>}
 */
const downloadImageBuffer = async (url, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 8000,
      });
      return Buffer.from(response.data, "binary");
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        // Exponential backoff: 200ms, 400ms
        await new Promise((resolve) =>
          setTimeout(resolve, 200 * Math.pow(2, attempt))
        );
      }
    }
  }

  const errorMsg = lastError?.message || "Unknown error";
  throw new Error(`Failed to download image after ${retries + 1} attempts: ${errorMsg}`);
};

/**
 * Parse image URL and return attachment configuration
 * Handles both base64 data URIs and external URLs
 * @param {string} imageUrl
 * @param {string} userName
 * @returns {Promise<{content: Buffer, contentType: string, filename: string}>}
 */
const prepareImageAttachment = async (imageUrl, userName) => {
  let attachmentContent;
  let contentType = "image/jpeg";
  let filename = `ai-portrait-${userName}-${Date.now()}.jpg`;

  try {
    // Handle base64 data URI
    if (imageUrl.startsWith("data:")) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Invalid base64 data URI format");
      }

      contentType = match[1];
      attachmentContent = Buffer.from(match[2], "base64");

      const ext = contentType.split("/")[1] || "jpg";
      filename = `ai-portrait-${userName}-${Date.now()}.${ext}`;
    } else {
      // Download from external URL (Cloudinary, etc.)
      attachmentContent = await downloadImageBuffer(imageUrl);

      // Detect format from URL or default to JPEG
      if (imageUrl.includes(".png")) {
        contentType = "image/png";
        filename = `ai-portrait-${userName}-${Date.now()}.png`;
      } else if (imageUrl.includes(".webp")) {
        contentType = "image/webp";
        filename = `ai-portrait-${userName}-${Date.now()}.webp`;
      }
    }

    return { content: attachmentContent, contentType, filename };
  } catch (error) {
    throw new Error(`Image preparation failed: ${error.message}`);
  }
};

/**
 * Builds styled HTML email template
 * @param {string} userName
 * @returns {string} HTML content
 */
const buildEmailTemplate = (userName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Portrait</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background-color: #0f0a1a;
      color: #f1f5f9;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #160f2a 0%, #1a1145 100%);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 16px;
      padding: 40px 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      background: linear-gradient(135deg, #818cf8, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
      font-size: 28px;
      font-weight: 700;
    }
    .greeting {
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    .image-container {
      margin: 30px auto;
      border-radius: 12px;
      overflow: hidden;
      border: 3px solid rgba(99, 102, 241, 0.4);
      max-width: 100%;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
    }
    .portrait {
      width: 100%;
      height: auto;
      display: block;
    }
    .cta-text {
      color: #cbd5e1;
      font-size: 14px;
      margin-top: 20px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 30px;
      color: #64748b;
      font-size: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 20px;
    }
    .brand {
      color: #8b5cf6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hey ${userName}! 🎨</h1>
    <p class="greeting">Your stunning AI portrait has been generated and is ready for you.</p>
    
    <div class="image-container">
      <img src="cid:aiportrait" alt="Your AI Portrait" class="portrait" />
    </div>
    
    <p class="cta-text">Thank you for using AI Photo Booth. We hope you love your new look! Share it with friends and create more portraits whenever you'd like.</p>
    
    <div class="footer">
      <span class="brand">✦ AI Photo Booth ✦</span><br/>
      Premium AI Experience • Powered by Advanced Machine Learning
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Sends portrait email (NON-BLOCKING)
 * 
 * IMPORTANT: This function does NOT throw errors.
 * Instead, it logs failures and resolves successfully.
 * Email failures are treated as non-critical.
 * 
 * @param {string} toEmail - Recipient email
 * @param {string} userName - User's display name
 * @param {string} imageUrl - Image URL or data URI
 * @returns {Promise<{success: boolean, messageId?: string, error?: string, mock?: boolean}>}
 */
const sendPortraitEmail = async (toEmail, userName, imageUrl) => {
  const startTime = Date.now();
  const logPrefix = `[EmailService] ${toEmail}`;

  try {
    // Check if email service is configured
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`${logPrefix} Email not configured (missing credentials)`);
      
      // In production, we still succeed - image is available
      return {
        success: false,
        error: "Email service not configured",
        mock: true,
      };
    }

    console.log(`${logPrefix} Preparing email...`);

    // Prepare image attachment
    let attachment;
    try {
      attachment = await prepareImageAttachment(imageUrl, userName);
    } catch (imageError) {
      // Don't block on image download failure
      console.warn(`${logPrefix} Image preparation failed: ${imageError.message}`);
      return {
        success: false,
        error: `Image preparation failed: ${imageError.message}`,
      };
    }

    // Build mail options
    const mailOptions = {
      from: `"AI Photo Booth" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your AI Portrait is Ready, ${userName}! 📸`,
      html: buildEmailTemplate(userName),
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
          cid: "aiportrait",
        },
      ],
    };

    // Send email (non-blocking - won't crash if it fails)
    transporter.sendMail(mailOptions, (err, info) => {
      const duration = Date.now() - startTime;
      
      if (err) {
        console.error(
          `${logPrefix} Email send failed (${duration}ms): ${err.message}`
        );
        // Log error but don't throw - image remains available
      } else {
        console.log(
          `${logPrefix} Email sent successfully (${duration}ms): ${info.messageId}`
        );
      }
    });

    // Return success immediately - email is sent in background
    return {
      success: true,
      message: "Email queued for delivery",
      queued: true,
    };
  } catch (error) {
    // Catch any unexpected errors
    const duration = Date.now() - startTime;
    console.error(
      `${logPrefix} Unexpected error during email preparation (${duration}ms): ${error.message}`
    );

    // Still return success - image generation worked
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ASYNC VERSION - Waits for email confirmation
 * Use this if you need to wait for delivery confirmation.
 * Otherwise, use sendPortraitEmail (non-blocking) for better UX.
 * 
 * @param {string} toEmail
 * @param {string} userName
 * @param {string} imageUrl
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendPortraitEmailAsync = async (toEmail, userName, imageUrl) => {
  const startTime = Date.now();
  const logPrefix = `[EmailService] ${toEmail}`;

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`${logPrefix} Email not configured`);
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    console.log(`${logPrefix} Preparing email...`);

    // Prepare image attachment with timeout
    const attachment = await Promise.race([
      prepareImageAttachment(imageUrl, userName),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image preparation timeout")), 10000)
      ),
    ]);

    // Build mail options
    const mailOptions = {
      from: `"AI Photo Booth" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your AI Portrait is Ready, ${userName}! 📸`,
      html: buildEmailTemplate(userName),
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
          cid: "aiportrait",
        },
      ],
    };

    // Send with timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email send timeout")), 15000)
      ),
    ]);

    const duration = Date.now() - startTime;
    console.log(`${logPrefix} Email sent (${duration}ms): ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${logPrefix} Email failed (${duration}ms): ${error.message}`);

    // Return error but don't throw
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Health check for email service
 * Use this in your health check endpoint
 * @returns {Promise<{healthy: boolean, configured: boolean, message: string}>}
 */
const checkEmailServiceHealth = async () => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      healthy: true, // Not an error - just not configured
      configured: false,
      message: "Email service not configured (optional)",
    };
  }

  try {
    // Test connection without blocking
    const testResult = await Promise.race([
      new Promise((resolve) => {
        transporter.verify((err, success) => {
          resolve(success);
        });
      }),
      new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);

    return {
      healthy: testResult !== false,
      configured: true,
      message: testResult ? "Email service healthy" : "Email service timeout",
    };
  } catch (error) {
    return {
      healthy: false,
      configured: true,
      message: `Email service error: ${error.message}`,
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
};