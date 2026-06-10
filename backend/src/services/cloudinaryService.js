const cloudinary = require("cloudinary").v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64-encoded image to Cloudinary
 * @param {string} base64String - The base64 image string (can include data URI prefix)
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadImage = async (base64String) => {
  try {
    // Ensure the base64 string has the proper data URI prefix
    let imageData = base64String;
    if (!imageData.startsWith("data:")) {
      imageData = `data:image/png;base64,${imageData}`;
    }

    console.log("[Cloudinary] Uploading base64 image...");

    const result = await cloudinary.uploader.upload(imageData, {
      folder: "ai-photobooth",
      resource_type: "image",
      transformation: [
        { width: 1024, height: 1024, crop: "limit" }, // Limit max size
        { quality: "auto", fetch_format: "auto" }, // Auto-optimize
      ],
    });

    console.log(`[Cloudinary] Upload successful: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload an image from a URL to Cloudinary
 * @param {string} imageUrl - The URL of the image to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadImageFromUrl = async (imageUrl) => {
  try {
    console.log(`[Cloudinary] Uploading image from URL: ${imageUrl}`);

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "ai-photobooth",
      resource_type: "image",
      transformation: [
        { width: 1024, height: 1024, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    console.log(`[Cloudinary] URL upload successful: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("[Cloudinary] URL upload failed:", error.message);
    throw new Error(`Cloudinary URL upload failed: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  uploadImageFromUrl,
  cloudinary,
};
