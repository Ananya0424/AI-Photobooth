const { Client } = require("@gradio/client");

/**
 * Image Enhancement Service
 *
 * Enhancement pipeline (in priority order):
 *   1. CodeFormer  — best quality, background + face upsampling built-in
 *   2. GFPGAN      — fallback if CodeFormer is unavailable
 *   3. Original    — returned unchanged if all enhancement fails (never blocks the user)
 *
 * Fixes applied vs original:
 *   - Every Client.connect() and client.predict() wrapped in a per-call timeout
 *   - urlToBlob error surfaced with a descriptive message
 *   - GFPGAN space list kept but made easier to extend via GFPGAN_SPACES constant
 *   - No silent swallowing of errors — all failures are logged clearly
 */

const GRADIO_CONNECT_TIMEOUT_MS = 30_000;  // 30 s to connect to a Space
const GRADIO_PREDICT_TIMEOUT_MS = 120_000; // 2 min for inference (cold-start)

const GFPGAN_SPACES = [
  "Xintao/GFPGAN",
  "nightfury/GFPGAN",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Wrap a promise with a timeout rejection.
 */
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);

/**
 * Download an image from a URL and return it as a Blob.
 * Throws a descriptive error rather than a generic fetch failure.
 */
const urlToBlob = async (url) => {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`urlToBlob: network error fetching ${url} — ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`urlToBlob: HTTP ${res.status} fetching ${url}`);
  }
  const arrayBuffer  = await res.arrayBuffer();
  const contentType  = res.headers.get("content-type") || "image/png";
  return new Blob([arrayBuffer], { type: contentType });
};

// ─── CodeFormer ───────────────────────────────────────────────────────────────

/**
 * Restore faces using CodeFormer via Hugging Face.
 * Includes background enhancement, face upsampling, and 2× upscale.
 *
 * @param {string} imageUrl  HTTP/HTTPS URL of the image to enhance
 * @returns {Promise<string>} URL of the enhanced image
 */
const restoreFaceCodeFormer = async (imageUrl) => {
  console.log("[ImageEnhancer] Starting CodeFormer face restoration...");
  const startTime = Date.now();

  const imageBlob = await urlToBlob(imageUrl);

  const client = await withTimeout(
    Client.connect("sczhou/CodeFormer", {
      hf_token: process.env.HF_TOKEN || undefined,
    }),
    GRADIO_CONNECT_TIMEOUT_MS,
    "CodeFormer connect"
  );

  const result = await withTimeout(
    client.predict("/inference", [
      imageBlob,
      true,  // Pre_Face_Align
      true,  // Background_Enhance
      true,  // Face_Upsample
      2,     // Rescaling_Factor (2×)
      0.7,   // Codeformer_Fidelity
    ]),
    GRADIO_PREDICT_TIMEOUT_MS,
    "CodeFormer predict"
  );

  const outputUrl = result?.data?.[0]?.url || result?.data?.[0];
  if (!outputUrl) throw new Error("CodeFormer returned no output URL");

  console.log(`[ImageEnhancer] CodeFormer complete in ${Date.now() - startTime}ms`);
  return outputUrl;
};

// ─── GFPGAN ───────────────────────────────────────────────────────────────────

/**
 * Restore faces using GFPGAN via Hugging Face.
 * Tries each space in GFPGAN_SPACES in order and returns the first success.
 *
 * @param {string} imageUrl  HTTP/HTTPS URL of the image to enhance
 * @returns {Promise<string>} URL of the enhanced image
 */
const restoreFaceGFPGAN = async (imageUrl) => {
  console.log("[ImageEnhancer] Starting GFPGAN face restoration...");
  const startTime  = Date.now();
  const imageBlob  = await urlToBlob(imageUrl);
  let   lastError;

  for (const spaceName of GFPGAN_SPACES) {
    try {
      console.log(`[ImageEnhancer] Trying GFPGAN space: ${spaceName}`);

      const client = await withTimeout(
        Client.connect(spaceName, {
          hf_token: process.env.HF_TOKEN || undefined,
        }),
        GRADIO_CONNECT_TIMEOUT_MS,
        `GFPGAN connect (${spaceName})`
      );

      const result = await withTimeout(
        client.predict("/predict", {
          img:     imageBlob,
          version: "v1.4",
          scale:   2,
        }),
        GRADIO_PREDICT_TIMEOUT_MS,
        `GFPGAN predict (${spaceName})`
      );

      const outputUrl = result?.data?.[0]?.url || result?.data?.[0];
      if (!outputUrl) throw new Error(`${spaceName} returned no output URL`);

      console.log(
        `[ImageEnhancer] GFPGAN (${spaceName}) complete in ${Date.now() - startTime}ms`
      );
      return outputUrl;
    } catch (err) {
      console.warn(`[ImageEnhancer] GFPGAN space ${spaceName} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All GFPGAN spaces failed");
};

// ─── Main enhancement pipeline ────────────────────────────────────────────────

/**
 * Enhance an image through the best available method.
 *
 * Tries CodeFormer first (highest quality), then GFPGAN, then returns the
 * original URL unchanged.  This function NEVER throws — callers can always
 * expect a usable image URL back.
 *
 * @param {string} imageUrl  HTTP/HTTPS URL of the image to enhance
 * @returns {Promise<string>} URL of the (possibly enhanced) image
 */
const enhanceImage = async (imageUrl) => {
  const startTime = Date.now();
  console.log("[ImageEnhancer] Starting enhancement pipeline...");

  // Attempt 1: CodeFormer
  try {
    const url = await restoreFaceCodeFormer(imageUrl);
    console.log(`[ImageEnhancer] Pipeline complete via CodeFormer (${Date.now() - startTime}ms)`);
    return url;
  } catch (err) {
    console.warn(`[ImageEnhancer] CodeFormer failed — trying GFPGAN: ${err.message}`);
  }

  // Attempt 2: GFPGAN
  try {
    const url = await restoreFaceGFPGAN(imageUrl);
    console.log(`[ImageEnhancer] Pipeline complete via GFPGAN (${Date.now() - startTime}ms)`);
    return url;
  } catch (err) {
    console.warn(`[ImageEnhancer] GFPGAN also failed — returning original: ${err.message}`);
  }

  // Fallback: return original image unchanged
  console.log("[ImageEnhancer] All enhancement methods failed. Using original image.");
  return imageUrl;
};

module.exports = {
  enhanceImage,
  restoreFaceGFPGAN,
  restoreFaceCodeFormer,
};