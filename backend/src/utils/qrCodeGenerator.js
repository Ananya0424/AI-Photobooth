const QRCode = require("qrcode");

/**
 * Generate a QR code as a base64 data URL
 * @param {string} text - The text/URL to encode in the QR code
 * @returns {Promise<string>} Base64 data URL of the QR code image (PNG)
 */
const generateQRCode = async (text) => {
  try {
    console.log(`[QR Generator] Generating QR code for: ${text}`);

    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    console.log("[QR Generator] QR code generated successfully");
    return qrDataUrl;
  } catch (error) {
    console.error("[QR Generator] Failed to generate QR code:", error.message);
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

module.exports = { generateQRCode };
