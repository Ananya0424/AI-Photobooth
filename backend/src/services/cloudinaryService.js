const cloudinary = require("cloudinary").v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64-encoded image to Cloudinary with dimension logging
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

    const inputSizeKB = (imageData.length / 1024).toFixed(2);
    console.log("[Cloudinary] Uploading base64 image...");
    console.log(`[Cloudinary] Input size: ${inputSizeKB} KB`);

    const result = await cloudinary.uploader.upload(imageData, {
      folder: "ai-photobooth",
      resource_type: "image",
      quality: "auto:best",
      fetch_format: "auto",
    });

    console.log(`[Cloudinary] Upload successful:`);
    console.log(`  Secure URL: ${result.secure_url}`);
    console.log(`  Dimensions: ${result.width} × ${result.height} px`);
    console.log(`  File size: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`  Format: ${result.format}`);
    console.log(`  Version: ${result.version}`);
    
    return result.secure_url;
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload an image from a URL to Cloudinary with dimension logging
 * @param {string} imageUrl - The URL of the image to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadImageFromUrl = async (imageUrl) => {
  try {
    console.log(`[Cloudinary] Uploading image from URL...`);
    console.log(`[Cloudinary] Source URL: ${imageUrl.substring(0, 100)}...`);

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "ai-photobooth",
      resource_type: "image",
      quality: "auto:best",
      fetch_format: "auto",
    });

    console.log(`[Cloudinary] URL upload successful:`);
    console.log(`  Secure URL: ${result.secure_url}`);
    console.log(`  Dimensions: ${result.width} × ${result.height} px`);
    console.log(`  File size: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`  Format: ${result.format}`);
    
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