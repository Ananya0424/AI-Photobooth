const { Client } = require("@gradio/client");
const sharp = require("sharp");

// FIXED: Render has HUGGING_FACE_API_TOKEN set, but every call site in this
// file only ever read HF_TOKEN — so the token was always undefined in
// production. Read both, preferring HF_TOKEN if both happen to be set, so
// existing local .env files using HF_TOKEN keep working too.
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGING_FACE_API_TOKEN || undefined;
if (!HF_TOKEN) {
  console.warn("[ImageEnhancer] No HF token found in HF_TOKEN or HUGGING_FACE_API_TOKEN — requests will be unauthenticated and may be rate-limited.");
}

/**
 * Best-effort probe of an image URL's dimensions for logging only.
 * Never throws.
 */
const probeUrlDimensions = async (url) => {
  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const metadata = await sharp(buf).metadata();
    return { width: metadata.width || null, height: metadata.height || null };
  } catch {
    return { width: null, height: null };
  }
};

/**
 * Image Enhancement Service — UPDATED FOR RENDER DEPLOYMENT
 *
 * Changes:
 *   - Dynamic timeout: 120s for production (Render), 30s for localhost
 *   - Enhancement result now includes status object (method, success, timeMs, error)
 *   - All failures logged with clear error messages
 *   - Never throws — always returns a usable URL
 *
 * Enhancement pipeline (in priority order):
 *   1. CodeFormer  — best quality, background + face upsampling built-in
 *   2. GFPGAN      — fallback if CodeFormer is unavailable
 *   3. Original    — returned unchanged if all enhancement fails (never blocks the user)
 */

// Dynamic timeout based on environment
const getGradioConnectTimeout = () => {
  // Render cold-starts can take 45-120s; 30s is too aggressive
  return process.env.NODE_ENV === 'production'
    ? parseInt(process.env.GRADIO_CONNECT_TIMEOUT || '120000', 10)
    : 30_000;
};

const GRADIO_CONNECT_TIMEOUT_MS = getGradioConnectTimeout();
const GRADIO_PREDICT_TIMEOUT_MS = parseInt(process.env.GRADIO_PREDICT_TIMEOUT || '180000', 10);

const GFPGAN_SPACES = [
  "Xintao/GFPGAN",
  "nightfury/GFPGAN",
];

console.log(`[ImageEnhancer] Configured timeouts: connect=${GRADIO_CONNECT_TIMEOUT_MS}ms, predict=${GRADIO_PREDICT_TIMEOUT_MS}ms`);

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
  console.log("[ImageEnhancer:CodeFormer] Starting face restoration...");
  console.log(`[ImageEnhancer:CodeFormer] Connect timeout: ${GRADIO_CONNECT_TIMEOUT_MS}ms, Predict timeout: ${GRADIO_PREDICT_TIMEOUT_MS}ms`);
  const startTime = Date.now();

  const inputDims = await probeUrlDimensions(imageUrl);
  console.log("Face Swap Input Resolution:", inputDims.width, inputDims.height);

  const imageBlob = await urlToBlob(imageUrl);

  const client = await withTimeout(
    Client.connect("sczhou/CodeFormer", {
      hf_token: HF_TOKEN,
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

  const outputDims = await probeUrlDimensions(outputUrl);
  console.log("Face Swap Output Resolution:", outputDims.width, outputDims.height);

  const elapsed = Date.now() - startTime;
  console.log(`[ImageEnhancer:CodeFormer] SUCCESS — completed in ${elapsed}ms`);
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
  console.log("[ImageEnhancer:GFPGAN] Starting face restoration...");
  const startTime  = Date.now();

  const inputDims = await probeUrlDimensions(imageUrl);
  console.log("Face Swap Input Resolution:", inputDims.width, inputDims.height);

  const imageBlob  = await urlToBlob(imageUrl);
  let   lastError;

  for (const spaceName of GFPGAN_SPACES) {
    try {
      console.log(`[ImageEnhancer:GFPGAN] Attempting space: ${spaceName}`);

      const client = await withTimeout(
        Client.connect(spaceName, {
          hf_token: HF_TOKEN,
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

      const outputDims = await probeUrlDimensions(outputUrl);
      console.log("Face Swap Output Resolution:", outputDims.width, outputDims.height);

      const elapsed = Date.now() - startTime;
      console.log(
        `[ImageEnhancer:GFPGAN] SUCCESS — ${spaceName} completed in ${elapsed}ms`
      );
      return outputUrl;
    } catch (err) {
      console.warn(`[ImageEnhancer:GFPGAN] Space ${spaceName} failed: ${err.message}`);
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
 * expect a usable result back.
 *
 * @param {string} imageUrl  HTTP/HTTPS URL of the image to enhance
 * @returns {Promise<{url: string, method: string, success: boolean, timeMs: number, error?: string}>}
 *          Status object with URL, enhancement method used, and timing info
 */
const enhanceImage = async (imageUrl) => {
  const startTime = Date.now();
  console.log("[ImageEnhancer] Starting enhancement pipeline...");

  // Attempt 1: CodeFormer
  try {
    const url = await restoreFaceCodeFormer(imageUrl);
    const elapsed = Date.now() - startTime;
    console.log(`[ImageEnhancer] Pipeline complete via CodeFormer (${elapsed}ms)`);
    return {
      url,
      method: 'codeformer',
      success: true,
      timeMs: elapsed,
    };
  } catch (err) {
    console.warn(`[ImageEnhancer] CodeFormer failed: ${err.message}`);
  }

  // Attempt 2: GFPGAN
  try {
    const url = await restoreFaceGFPGAN(imageUrl);
    const elapsed = Date.now() - startTime;
    console.log(`[ImageEnhancer] Pipeline complete via GFPGAN (${elapsed}ms)`);
    return {
      url,
      method: 'gfpgan',
      success: true,
      timeMs: elapsed,
    };
  } catch (err) {
    console.warn(`[ImageEnhancer] GFPGAN also failed: ${err.message}`);
  }

  // Fallback: return original image unchanged
  const elapsed = Date.now() - startTime;
  console.log(`[ImageEnhancer] FALLBACK — All enhancement methods failed. Returning original image.`);
  return {
    url: imageUrl,
    method: 'original',
    success: false,
    timeMs: elapsed,
    error: 'Both CodeFormer and GFPGAN failed; returning unenhanced image',
  };
};

module.exports = {
  enhanceImage,
  restoreFaceGFPGAN,
  restoreFaceCodeFormer,
};