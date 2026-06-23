const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Service to send email with the generated portrait.
 * Supports Gmail SMTP with User and Pass.
 */

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes("your_gmail") || pass.includes("your_app_password")) {
    console.warn("[Email Service] EMAIL_USER or EMAIL_PASS not configured correctly. Email sending will be mocked.");
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: { user, pass },
  });
};

/**
 * Downloads an image from a URL and returns it as a Buffer
 * @param {string} url - HTTP/HTTPS URL
 * @returns {Promise<Buffer>}
 */
const downloadImageBuffer = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error(`[Email Service] Failed to download image from URL: ${url}`, error.message);
    throw new Error(`Failed to download image for email attachment: ${error.message}`);
  }
};

/**
 * Sends a styled HTML email with the generated portrait attached/inlined.
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's name
 * @param {string} imageUrl - URL of the generated portrait (Cloudinary or base64 data URI)
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
const sendPortraitEmail = async (toEmail, userName, imageUrl) => {
  console.log(`[Email Service] Attempting to send portrait email to ${toEmail}...`);

  const transporter = getTransporter();

  if (!transporter) {
    console.log("[Email Service] MOCK MODE: Simulating email delivery success.");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: "Email delivery mocked successfully." };
  }

  try {
    let attachmentContent;
    let contentType = "image/jpeg";
    let filename = `ai-portrait-${userName}-${Date.now()}.jpg`;

    // Process image source
    if (imageUrl.startsWith("data:")) {
      // Parse base64 data URI
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Invalid base64 image data URI format");
      }
      contentType = match[1];
      attachmentContent = Buffer.from(match[2], "base64");
      
      const ext = contentType.split("/")[1] || "jpg";
      filename = `ai-portrait-${userName}-${Date.now()}.${ext}`;
    } else {
      // Download from external URL (e.g. Cloudinary)
      attachmentContent = await downloadImageBuffer(imageUrl);
      if (imageUrl.includes(".png")) {
        contentType = "image/png";
        filename = `ai-portrait-${userName}-${Date.now()}.png`;
      }
    }

    const mailOptions = {
      from: `"AI Photo Booth" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your AI Portrait is Ready, ${userName}! 📸`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0f0a1a;
              color: #f1f5f9;
              margin: 0;
              padding: 0;
              text-align: center;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background: linear-gradient(135deg, #160f2a 0%, #1a1145 100%);
              border: 1px solid rgba(139, 92, 246, 0.2);
              border-radius: 16px;
              padding: 40px 20px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            h1 {
              font-family: 'Outfit', 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #818cf8, #a78bfa, #f472b6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              color: #a78bfa;
              margin-bottom: 10px;
              font-size: 28px;
            }
            p {
              color: #94a3b8;
              font-size: 16px;
              line-height: 1.5;
              margin-bottom: 25px;
            }
            .image-container {
              margin: 20px auto;
              border-radius: 12px;
              overflow: hidden;
              border: 3px solid rgba(99, 102, 241, 0.4);
              max-width: 400px;
              box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
            }
            .portrait {
              width: 100%;
              height: auto;
              display: block;
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
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hey ${userName}!</h1>
            <p>Your stunning new AI portrait has been processed and is ready for you. Check it out below!</p>
            
            <div class="image-container">
              <img src="cid:aiportrait" alt="Your AI Portrait" class="portrait" />
            </div>
            
            <p>Thank you for using our AI Photo Booth. We hope you love your new look!</p>
            
            <div class="footer">
              <span class="brand">✦ AI Photo Booth ✦</span><br/>
              Premium AI Experience • All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: filename,
          content: attachmentContent,
          contentType: contentType,
          cid: "aiportrait", // inline attachment CID
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Service] Error sending email:", error.message);
    throw new Error(`Failed to send email to ${toEmail}: ${error.message}`);
  }
};

module.exports = {
  sendPortraitEmail,
};
