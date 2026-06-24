const { OpenAI } = require("openai");
const { Client } = require("@gradio/client");
const { enhanceImage } = require("./imageEnhancer");

/**
 * AI Service — image generation + face swap pipeline
 *
 * Pipeline:
 *   1. Generate base image via OpenAI (or skip in mock mode)
 *   2. Swap user face onto generated image via Gradio (tonyassi/face-swap)
 *   3. Enhance result via CodeFormer / GFPGAN (imageEnhancer)
 *
 * Fixes applied vs original:
 *   - Singleton OpenAI client (one instance per process)
 *   - Unified isMockMode() — single source of truth
 *   - Gradio calls wrapped in per-call timeouts (no infinite hangs)
 *   - Retry counter renamed maxAttempts to avoid off-by-one confusion
 *   - Prompt sanitisation driven by a config array (no long if/replace chains)
 *   - getBlobFromImage consolidated and exported for reuse
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADIO_TIMEOUT_MS = 60_000; // 60 s per Gradio call (cold-start can be slow)
const OPENAI_TIMEOUT_MS = 300_000; // 5 min for image generation

// ─── Singleton OpenAI client ──────────────────────────────────────────────────

let _openaiClient = null;

const getOpenAIClient = () => {
  if (_openaiClient) return _openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  _openaiClient = new OpenAI({ apiKey });
  return _openaiClient;
};

// ─── Mock mode detection ──────────────────────────────────────────────────────

/**
 * Returns true when no real OpenAI API key is configured.
 * Single authoritative check used by this file and server.js.
 */
const isMockMode = () => {
  const key = process.env.OPENAI_API_KEY || "";
  return (
    key === "" ||
    key.startsWith("sk-proj-your_") ||
    key === "your_openai_api_key_here"
  );
};

// ─── Prompt sanitisation ──────────────────────────────────────────────────────

const SANITIZE_RULES = [
  { pattern: /Captain Marvel-style/gi, replacement: "cosmic" },
  { pattern: /Captain Marvel/gi,       replacement: "cosmic hero" },
  { pattern: /Iron Man-style/gi,        replacement: "futuristic high-tech" },
  { pattern: /Iron Man/gi,              replacement: "high-tech hero" },
  { pattern: /NASA logo/gi,             replacement: "space badge" },
  { pattern: /NASA/gi,                  replacement: "space agency" },
  { pattern: /explosions/gi,            replacement: "swirling colorful energy" },
  { pattern: /fire and debris/gi,       replacement: "glowing light embers" },
  { pattern: /Destroyed city/gi,        replacement: "futuristic city skyline" },
  { pattern: /battlefield/gi,           replacement: "dramatic sky" },
  { pattern: /Avenger/gi,               replacement: "superhero" },
];

const sanitizePrompt = (prompt) => {
  if (!prompt) return "";
  return SANITIZE_RULES.reduce(
    (acc, { pattern, replacement }) => acc.replace(pattern, replacement),
    prompt
  );
};

const getSuperSafeFallbackPrompt = (originalPrompt = "") => {
  const lower = originalPrompt.toLowerCase();

  if (lower.includes("astronaut") || lower.includes("nasa") || lower.includes("space")) {
    return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing a highly detailed white space suit inside a spaceship, looking at the camera. Sharp focus, realistic lighting, studio quality.";
  }
  if (
    lower.includes("superhero") ||
    lower.includes("avenger") ||
    lower.includes("armor") ||
    lower.includes("marvel") ||
    lower.includes("iron")
  ) {
    return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing high-tech futuristic metallic red and gold body armor, looking at the camera. Sharp focus, realistic lighting, studio quality.";
  }
  if (
    lower.includes("king") ||
    lower.includes("queen") ||
    lower.includes("crown") ||
    lower.includes("tiara")
  ) {
    return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing an ornate golden crown and royal robes, looking at the camera. Regal palace background, sharp focus, realistic lighting, studio quality.";
  }

  return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing formal business attire, looking at the camera. Office studio background, sharp focus, realistic lighting, studio quality.";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert any supported image reference to a Blob.
 *
 * Supports:
 *   - data: URIs        (base64 encoded)
 *   - /assets/…         (local frontend/public files)
 *   - any http/https URL
 */
const getBlobFromImage = async (imageInput) => {
  if (!imageInput) throw new Error("getBlobFromImage: imageInput is required");

  if (imageInput.startsWith("data:")) {
    const res = await fetch(imageInput);
    if (!res.ok) throw new Error("getBlobFromImage: failed to parse data URI");
    return res.blob();
  }

  if (imageInput.startsWith("/assets/")) {
    const path = require("path");
    const fs   = require("fs");
    const filePath = path.join(__dirname, "../../../frontend/public", imageInput);
    if (!fs.existsSync(filePath)) {
      throw new Error(`getBlobFromImage: local asset not found — ${filePath}`);
    }
    const buffer = fs.readFileSync(filePath);
    const mime   = imageInput.endsWith(".png") ? "image/png" : "image/jpeg";
    return new Blob([buffer], { type: mime });
  }

  const res = await fetch(imageInput);
  if (!res.ok) {
    throw new Error(
      `getBlobFromImage: HTTP ${res.status} fetching ${imageInput}`
    );
  }
  return res.blob();
};

/**
 * Wrap a promise with a timeout that rejects after `ms` milliseconds.
 */
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

// ─── Gradio face swap ─────────────────────────────────────────────────────────

/**
 * Swap the face from `sourceImageUrl` onto `destImageUrl` using Gradio.
 * Returns the swapped image URL, or throws on failure.
 */
const runFaceSwap = async (sourceImageUrl, destImageUrl) => {
  console.log("[AI Service] Connecting to Gradio face-swap space...");

  const [srcBlob, destBlob] = await Promise.all([
    getBlobFromImage(sourceImageUrl),
    getBlobFromImage(destImageUrl),
  ]);

  const client = await withTimeout(
    Client.connect("tonyassi/face-swap"),
    GRADIO_TIMEOUT_MS,
    "Gradio connect"
  );

  const result = await withTimeout(
    client.predict("/swap_faces", { src_img: srcBlob, dest_img: destBlob }),
    GRADIO_TIMEOUT_MS,
    "Gradio face-swap predict"
  );

  const url = result?.data?.[0]?.url;
  if (!url) throw new Error("Face-swap API returned no image URL");

  console.log("[AI Service] Face swap successful.");
  return url;
};

// ─── OpenAI image generation ──────────────────────────────────────────────────

/**
 * Generate a base outfit/scene image with OpenAI.
 * Retries up to `maxAttempts` times with progressively safer prompts on
 * content-policy rejections.
 *
 * Returns a base64 data URI or a CDN URL.
 */
const generateBaseImage = async (prompt, selectedModel, sessionId = "unknown") => {
  const client    = getOpenAIClient();
  const modelName = selectedModel || "gpt-image-2";
  const label     = `[AI Service][${sessionId}]`;
  const maxAttempts = 3; // attempt 1: original, 2: sanitized, 3: ultra-safe

  const PREFIX = "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person.";
  const SUFFIX = "The person is facing slightly forward with sharp focus on the face. Ultra-detailed skin texture, sharp eyes, realistic lighting. Studio quality photography. Do not add any text or watermarks.";

  let currentPrompt = prompt;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const fullPrompt = `${PREFIX} ${currentPrompt}. ${SUFFIX}`;
    console.log(`${label} Generating image — attempt ${attempt}/${maxAttempts} (model: ${modelName})`);

    const params = {
      model:  modelName,
      prompt: fullPrompt,
      n:      1,
      size:   "1024x1024",
    };

    if (modelName === "dall-e-3") {
      params.quality = "hd";
      params.style   = "natural";
    }

    try {
      const response = await withTimeout(
        client.images.generate(params),
        OPENAI_TIMEOUT_MS,
        "OpenAI image generation"
      );

      const item = response?.data?.[0];
      if (!item) throw new Error("OpenAI returned an empty response");

      const imageUrl = item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
      if (!imageUrl) throw new Error("OpenAI response contained no image data");

      console.log(`${label} Image generated successfully on attempt ${attempt}.`);
      return imageUrl;
    } catch (err) {
      const isSafetyError =
        /safety|policy|rejected|content_policy_violation/i.test(err.message);

      if (isSafetyError && attempt < maxAttempts) {
        if (attempt === 1) {
          console.warn(`${label} Safety rejection on attempt 1 — retrying with sanitized prompt.`);
          currentPrompt = sanitizePrompt(currentPrompt);
        } else {
          console.warn(`${label} Safety rejection on attempt 2 — retrying with ultra-safe prompt.`);
          currentPrompt = getSuperSafeFallbackPrompt(prompt);
        }
        continue;
      }

      // Non-safety error or out of retries — rethrow
      console.error(`${label} Image generation failed on attempt ${attempt}: ${err.message}`);
      throw err;
    }
  }

  // Should never reach here
  throw new Error(`${label} Image generation exhausted all ${maxAttempts} attempts`);
};

// ─── Main public API ──────────────────────────────────────────────────────────

/**
 * Full pipeline: generate → face-swap → enhance.
 *
 * @param {string} sourceImageUrl   User's captured photo (URL or data URI)
 * @param {string} targetTemplateUrl Template image (URL, /assets/ path, or data URI)
 * @param {string} prompt           Style prompt for OpenAI
 * @param {string} selectedModel    OpenAI model ID (default: gpt-image-2)
 * @param {string} [sessionId]      For scoped log labels
 * @returns {Promise<string>}       Final image URL (Cloudinary or Gradio CDN)
 */
const generateFaceSwap = async (
  sourceImageUrl,
  targetTemplateUrl,
  prompt,
  selectedModel,
  sessionId = "unknown"
) => {
  const label = `[AI Service][${sessionId}]`;
  console.log(`${label} Starting face-swap pipeline (mock=${isMockMode()})...`);

  // ── Mock mode: skip OpenAI, swap face onto the raw template ──────────────
  if (isMockMode()) {
    console.log(`${label} MOCK MODE — swapping face onto template directly.`);
    try {
      const swappedUrl = await runFaceSwap(sourceImageUrl, targetTemplateUrl);
      try {
        return await enhanceImage(swappedUrl);
      } catch (enhErr) {
        console.warn(`${label} Mock enhancement failed — returning raw swap: ${enhErr.message}`);
        return swappedUrl;
      }
    } catch (err) {
      console.error(`${label} Mock face-swap failed — returning source image: ${err.message}`);
      return sourceImageUrl;
    }
  }

  // ── Step 1: Generate base image ───────────────────────────────────────────
  const generatedImageUrl = await generateBaseImage(prompt, selectedModel, sessionId);

  // ── Step 2: Face swap ─────────────────────────────────────────────────────
  let faceSwapUrl;
  try {
    faceSwapUrl = await runFaceSwap(sourceImageUrl, generatedImageUrl);
  } catch (err) {
    console.error(`${label} Face swap failed: ${err.message}`);
    throw err;
  }

  // ── Step 3: Enhance (non-fatal — never block the user) ───────────────────
  try {
    const enhanced = await enhanceImage(faceSwapUrl);
    console.log(`${label} Pipeline complete (with enhancement).`);
    return enhanced;
  } catch (enhErr) {
    console.warn(`${label} Enhancement failed — returning face-swapped image: ${enhErr.message}`);
    return faceSwapUrl;
  }
};

module.exports = {
  generateFaceSwap,
  isMockMode,
  getOpenAIClient,
  getBlobFromImage,
};