const axios = require("axios");

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildEmailTemplate = (userName, imageUrl) => {
  const safeUser = escapeHtml(userName);
  const imgSrc = imageUrl.startsWith("data:") ? "" : escapeHtml(imageUrl);
  
  // Use the direct cloudinary URL if available, otherwise just show an empty image or fallback
  const imageHtml = imgSrc 
    ? `<img src="${imgSrc}" alt="Your AI Portrait" class="portrait" />`
    : `<p style="color: #fff;">See the attached file for your portrait!</p>`;

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
      ${imageHtml}
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

const prepareImageAttachment = async (imageUrl, userName) => {
  const safeName = encodeURIComponent(userName).slice(0, 40);
  const ts = Date.now();

  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 data URI format");

    const contentType = match[1];
    const content = match[2]; // base64 string
    const ext = contentType.split("/")[1] || "jpg";

    return {
      content,
      name: `ai-portrait-${safeName}-${ts}.${ext}`,
    };
  }

  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 8000,
  });
  const content = Buffer.from(response.data).toString("base64");
  const contentType = response.headers["content-type"]?.split(";")[0] || "image/jpeg";
  const ext = contentType.split("/")[1] || "jpg";

  return {
    content,
    name: `ai-portrait-${safeName}-${ts}.${ext}`,
  };
};

const sendPortraitEmail = async (toEmail, userName, imageUrl) => {
  const logPrefix = `[EmailService:Brevo] ${toEmail}`;
  const apiKey = process.env.BREVO_API_KEY;

  try {
    if (!apiKey) {
      console.log(`${logPrefix} Brevo API key not configured.`);
      return { success: false, error: "Brevo API key not configured" };
    }

    console.log(`${logPrefix} Preparing attachment...`);
    let attachment;
    try {
      attachment = await prepareImageAttachment(imageUrl, userName);
    } catch (imgErr) {
      console.warn(`${logPrefix} Image preparation failed: ${imgErr.message}`);
      return { success: false, error: `Image preparation failed: ${imgErr.message}` };
    }

    console.log(`${logPrefix} Sending email via Brevo API...`);
    
    const senderEmail = process.env.EMAIL_USER || "ananyashar24@gmail.com";
    
    const payload = {
      sender: {
        name: "AI Photo Booth",
        email: senderEmail
      },
      to: [
        {
          email: toEmail,
          name: userName
        }
      ],
      subject: `Your AI Portrait is Ready, ${escapeHtml(userName)}! 📸`,
      htmlContent: buildEmailTemplate(userName, imageUrl),
      attachment: [
        {
          name: attachment.name,
          content: attachment.content
        }
      ]
    };

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 10000
    });

    console.log(`${logPrefix} Email sent via Brevo. messageId=${response.data.messageId}`);
    return { success: true, messageId: response.data.messageId };

  } catch (err) {
    console.error(`${logPrefix} Brevo API error:`, err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

const checkEmailHealth = async () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return {
      healthy: true,
      configured: false,
      message: "Brevo API key not configured (BREVO_API_KEY missing)",
    };
  }

  return {
    healthy: true,
    configured: true,
    message: "Brevo REST API configured",
  };
};

module.exports = {
  sendPortraitEmail,
  checkEmailHealth,
};
