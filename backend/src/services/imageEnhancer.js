const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");

/**
 * Image Enhancement Service
 * Uses free Hugging Face Gradio Spaces for:
 * 1. Face Restoration (GFPGAN) — sharpens faces, eyes, skin
 * 2. Upscaling (Real-ESRGAN) — increases resolution 2x
 */

/**
 * Download an image from a URL and return as a Blob
 */
const urlToBlob = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "image/png";
  return new Blob([arrayBuffer], { type: contentType });
};

/**
 * Restore faces using GFPGAN via Hugging Face
 * This dramatically improves face quality — sharper eyes, skin, and details
 */
const restoreFaceGFPGAN = async (imageUrl) => {
  console.log("[ImageEnhancer] Starting GFPGAN face restoration...");
  const startTime = Date.now();

  try {
    const imageBlob = await urlToBlob(imageUrl);

    // Try multiple GFPGAN spaces as fallbacks
    const spaces = [
      "Xintao/GFPGAN",
      "nightfury/GFPGAN",
    ];

    let lastError;
    for (const spaceName of spaces) {
      try {
        console.log(`[ImageEnhancer] Trying GFPGAN space: ${spaceName}`);
        const client = await Client.connect(spaceName, {
          hf_token: process.env.HF_TOKEN || undefined,
        });

        const result = await client.predict("/predict", {
          img: imageBlob,
          version: "v1.4",
          scale: 2,
        });

        if (result && result.data && result.data[0]) {
          const outputUrl = result.data[0].url || result.data[0];
          const elapsed = Date.now() - startTime;
          console.log(`[ImageEnhancer] GFPGAN restoration successful (${elapsed}ms)`);
          return outputUrl;
        }
      } catch (err) {
        console.warn(`[ImageEnhancer] GFPGAN space ${spaceName} failed:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("All GFPGAN spaces failed");
  } catch (error) {
    console.error("[ImageEnhancer] GFPGAN restoration failed:", error.message);
    throw error;
  }
};

/**
 * Restore faces using CodeFormer via Hugging Face
 * CodeFormer provides excellent face restoration with fidelity control
 */
const restoreFaceCodeFormer = async (imageUrl) => {
  console.log("[ImageEnhancer] Starting CodeFormer face restoration...");
  const startTime = Date.now();

  try {
    const imageBlob = await urlToBlob(imageUrl);

    const client = await Client.connect("sczhou/CodeFormer", {
      hf_token: process.env.HF_TOKEN || undefined,
    });

    const result = await client.predict("/predict", {
      image: imageBlob,
      background_enhance: true,
      face_upsample: true,
      upscale: 2,
      codeformer_fidelity: 0.7, // 0 = quality, 1 = fidelity. 0.7 = good balance
    });

    if (result && result.data && result.data[0]) {
      const outputUrl = result.data[0].url || result.data[0];
      const elapsed = Date.now() - startTime;
      console.log(`[ImageEnhancer] CodeFormer restoration successful (${elapsed}ms)`);
      return outputUrl;
    }

    throw new Error("Unexpected CodeFormer response");
  } catch (error) {
    console.error("[ImageEnhancer] CodeFormer restoration failed:", error.message);
    throw error;
  }
};

/**
 * Main enhancement pipeline:
 * 1. Try CodeFormer first (better quality, background + face upsampling built-in)
 * 2. Fall back to GFPGAN if CodeFormer fails
 * 3. Return original URL if all enhancement fails (never block the pipeline)
 */
const enhanceImage = async (imageUrl) => {
  console.log("[ImageEnhancer] Starting image enhancement pipeline...");
  const startTime = Date.now();

  // Try CodeFormer first (includes background enhance + face upsample + 2x upscale)
  try {
    const enhancedUrl = await restoreFaceCodeFormer(imageUrl);
    const elapsed = Date.now() - startTime;
    console.log(`[ImageEnhancer] Enhancement complete via CodeFormer (${elapsed}ms)`);
    return enhancedUrl;
  } catch (err) {
    console.warn("[ImageEnhancer] CodeFormer failed, trying GFPGAN fallback...");
  }

  // Try GFPGAN as fallback
  try {
    const enhancedUrl = await restoreFaceGFPGAN(imageUrl);
    const elapsed = Date.now() - startTime;
    console.log(`[ImageEnhancer] Enhancement complete via GFPGAN (${elapsed}ms)`);
    return enhancedUrl;
  } catch (err) {
    console.warn("[ImageEnhancer] GFPGAN also failed. Returning original image.");
  }

  // If all enhancement fails, return the original — never block the user
  console.log("[ImageEnhancer] All enhancement methods failed. Using original image.");
  return imageUrl;
};

module.exports = {
  enhanceImage,
  restoreFaceGFPGAN,
  restoreFaceCodeFormer,
};
