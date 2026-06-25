const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Best-effort probe of an image buffer's dimensions for logging only.
 * Never throws.
 */
const probeBufferDims = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return { width: metadata.width || null, height: metadata.height || null };
  } catch {
    return { width: null, height: null };
  }
};

/**
 * Upload a base64-encoded image to Cloudinary with dimension logging.
 *
 * @param {string} base64String - The base64 image string (can include data URI prefix)
 * @param {object} [transformation] - Optional Cloudinary transformation, e.g.
 *   { width: 512, height: 512, crop: "fill", gravity: "face" }. When omitted,
 *   the original resolution is preserved (Cloudinary does NOT resize unless
 *   you explicitly ask it to — this was previously a source of confusion).
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadImage = async (base64String, transformation = null) => {
  try {
    // Ensure the base64 string has the proper data URI prefix
    let imageData = base64String;
    if (!imageData.startsWith("data:")) {
      imageData = `data:image/png;base64,${imageData}`;
    }

    const inputSizeKB = (imageData.length / 1024).toFixed(2);
    const inputBuffer = Buffer.from(imageData.split(",")[1], "base64");
    const beforeDims = await probeBufferDims(inputBuffer);

    console.log("[Cloudinary] Uploading base64 image...");
    console.log(`[Cloudinary] Input size: ${inputSizeKB} KB`);
    console.log(`[Cloudinary] Input resolution (before upload): ${beforeDims.width} x ${beforeDims.height}`);

    const uploadOptions = {
      folder: "ai-photobooth",
      resource_type: "image",
      quality: "auto:best",
      fetch_format: "auto",
    };
    if (transformation) {
      uploadOptions.transformation = [transformation];
    }

    const result = await cloudinary.uploader.upload(imageData, uploadOptions);

    console.log(`[Cloudinary] Upload successful:`);
    console.log(`  Secure URL: ${result.secure_url}`);
    console.log(`  Dimensions: ${result.width} × ${result.height} px`);
    console.log(`Cloudinary Uploaded Resolution: ${result.width} ${result.height}`);
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
 * Upload an image from a URL to Cloudinary with dimension logging.
 *
 * @param {string} imageUrl - The URL of the image to upload
 * @param {object} [transformation] - Optional Cloudinary transformation, e.g.
 *   { width: 512, height: 512, crop: "fill", gravity: "face" }. Pass this when
 *   you need a guaranteed exact output size (e.g. the final image in the
 *   pipeline) — without it, the original resolution is preserved as-is.
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadImageFromUrl = async (imageUrl, transformation = null) => {
  try {
    console.log(`[Cloudinary] Uploading image from URL...`);
    console.log(`[Cloudinary] Source URL: ${imageUrl.substring(0, 100)}...`);

    // Best-effort "before" dimension probe (non-fatal if it fails)
    try {
      const res = await fetch(imageUrl);
      const buf = Buffer.from(await res.arrayBuffer());
      const beforeDims = await probeBufferDims(buf);
      console.log(`[Cloudinary] Input resolution (before upload): ${beforeDims.width} x ${beforeDims.height}`);
    } catch (probeErr) {
      console.warn(`[Cloudinary] Could not probe source dimensions: ${probeErr.message}`);
    }

    const uploadOptions = {
      folder: "ai-photobooth",
      resource_type: "image",
      quality: "auto:best",
      fetch_format: "auto",
    };
    if (transformation) {
      uploadOptions.transformation = [transformation];
    }

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);

    console.log(`[Cloudinary] URL upload successful:`);
    console.log(`  Secure URL: ${result.secure_url}`);
    console.log(`  Dimensions: ${result.width} × ${result.height} px`);
    console.log(`Cloudinary Uploaded Resolution: ${result.width} ${result.height}`);
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