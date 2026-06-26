const { OpenAI } = require("openai");
const { Client } = require("@gradio/client");
const sharp = require("sharp");
const { enhanceImage } = require("./imageEnhancer");
const { uploadImageFromUrl, uploadImage } = require("./cloudinaryService");

/**
 * Probe width/height of an image buffer or remote URL without fully
 * decoding/transcoding it. Never throws — returns nulls on failure so
 * logging never breaks the pipeline.
 */
const probeDimensions = async (source) => {
  try {
    let buffer;
    if (Buffer.isBuffer(source)) {
      buffer = source;
    } else if (typeof source === "string" && source.startsWith("data:")) {
      const base64 = source.split(",")[1];
      buffer = Buffer.from(base64, "base64");
    } else if (typeof source === "string") {
      const res = await fetch(source);
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      return { width: null, height: null };
    }
    const metadata = await sharp(buffer).metadata();
    return { width: metadata.width || null, height: metadata.height || null };
  } catch (err) {
    console.warn(`[AIService] probeDimensions failed: ${err.message}`);
    return { width: null, height: null };
  }
};

/**
 * AI Service — image generation + face swap pipeline (UPDATED FOR RENDER)
 *
 * Pipeline:
 *   1. Generate base image via OpenAI
 *   2. Upload generated image to Cloudinary (stable URL, avoids OpenAI 1hr expiry)
 *   3. Swap user face onto generated image via Gradio
 *   4. Upload face-swap result to Cloudinary (stable URL before enhancement)
 *   5. Enhance result via CodeFormer / GFPGAN (imageEnhancer)
 *
 * FIXES:
 *   - Separate Gradio connect/predict timeouts (was one shared 60s — too low for Render)
 *   - Null-check on OpenAI client before use
 *   - gpt-image-2 fake model IDs now mapped to real ones before API call
 *   - OpenAI URL uploaded to Cloudinary before face swap (prevents 1hr expiry failures)
 *   - Face-swap result uploaded to Cloudinary before enhancement (prevents Gradio URL expiry)
 *   - fs.readFileSync replaced with async fs.promises.readFile
 */

// ─── Constants ────────────────────────────────────────────────────────────────

// Separate timeouts for connect vs predict — Render cold-starts need more time
const GRADIO_CONNECT_TIMEOUT_MS = process.env.NODE_ENV === "production"
  ? parseInt(process.env.GRADIO_CONNECT_TIMEOUT || "120000", 10)
  : 30_000;

const GRADIO_PREDICT_TIMEOUT_MS = parseInt(
  process.env.GRADIO_PREDICT_TIMEOUT || "180000",
  10
);

const OPENAI_TIMEOUT_MS = 300_000; // 5 min for image generation

// Map fake/futuristic model IDs to real OpenAI image model IDs
const VALID_IMAGE_MODELS = {
  "gpt-image-2": "gpt-image-1",
  "gpt-image-2-2026-04-21":  "gpt-image-2",  // fake ID → real
  "gpt-image-1.5":           "gpt-image-2",  // fake ID → real
  "dall-e-3":                "dall-e-3",
  "dall-e-2":                "dall-e-2",
};

console.log(
  `[AIService] Gradio timeouts: connect=${GRADIO_CONNECT_TIMEOUT_MS}ms, predict=${GRADIO_PREDICT_TIMEOUT_MS}ms`
);

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
    return "A hyper-realistic, ultra high-quality, 8K cinematic digital render of a fictional character wearing a highly detailed white space suit inside a spaceship, looking at the camera. Sharp focus, realistic lighting, masterpiece digital art.";
  }
  if (
    lower.includes("superhero") ||
    lower.includes("avenger") ||
    lower.includes("armor") ||
    lower.includes("marvel") ||
    lower.includes("iron")
  ) {
    return "A hyper-realistic, ultra high-quality, 8K cinematic digital render of a fictional character wearing high-tech futuristic metallic red and gold body armor, looking at the camera. Sharp focus, realistic lighting, masterpiece digital art.";
  }
  if (
    lower.includes("king") ||
    lower.includes("queen") ||
    lower.includes("crown") ||
    lower.includes("tiara")
  ) {
    return "A hyper-realistic, ultra high-quality, 8K cinematic digital render of a fictional character wearing an ornate golden crown and royal robes, looking at the camera. Regal palace background, sharp focus, realistic lighting, masterpiece digital art.";
  }

  return "A hyper-realistic, ultra high-quality, 8K cinematic digital render of a fictional character wearing formal business attire, looking at the camera. Office studio background, sharp focus, realistic lighting, masterpiece digital art.";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert any supported image reference to a Blob.
 * FIXED: uses async fs.promises.readFile instead of blocking fs.readFileSync
 */
const getBlobFromImage = async (imageInput, label = "[getBlobFromImage]") => {
  if (!imageInput) throw new Error("getBlobFromImage: imageInput is required");

  let blob;

  if (imageInput.startsWith("data:")) {
    // Parse data URI directly — don't rely on fetch() for data URIs (Node compat)
    const match = imageInput.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("getBlobFromImage: invalid data URI format");
    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    blob = new Blob([buffer], { type: contentType });

  } else if (imageInput.startsWith("/assets/")) {
    // FIXED: async readFile instead of blocking readFileSync
    const path = require("path");
    const fs   = require("fs");
    const filePath = path.join(__dirname, "../../../frontend/public", imageInput);
    if (!fs.existsSync(filePath)) {
      throw new Error(`getBlobFromImage: local asset not found — ${filePath}`);
    }
    const buffer = await fs.promises.readFile(filePath);
    const mime   = imageInput.endsWith(".png") ? "image/png" : "image/jpeg";
    blob = new Blob([buffer], { type: mime });

  } else {
    const res = await fetch(imageInput);
    if (!res.ok) {
      throw new Error(
        `getBlobFromImage: HTTP ${res.status} fetching ${imageInput}`
      );
    }
    blob = await res.blob();
  }

  const sizeKB = (blob.size / 1024).toFixed(2);
  console.log(`${label} Blob prepared: ${sizeKB} KB, type: ${blob.type}`);

  return blob;
};

/**
 * Wrap a promise with a timeout rejection.
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
 * FIXED: separate connect/predict timeouts (was one shared 60s constant)
 */
const runFaceSwap = async (sourceImageUrl, destImageUrl, label = "[runFaceSwap]") => {
  console.log(`${label} Connecting to Gradio face-swap space...`);
  console.log(`${label} Connect timeout: ${GRADIO_CONNECT_TIMEOUT_MS}ms, Predict timeout: ${GRADIO_PREDICT_TIMEOUT_MS}ms`);

  const [srcBlob, destBlob] = await Promise.all([
    getBlobFromImage(sourceImageUrl, `${label}:src`),
    getBlobFromImage(destImageUrl, `${label}:dest`),
  ]);

  // FIXED: separate connect and predict timeouts
  const client = await withTimeout(
    Client.connect("tonyassi/face-swap"),
    GRADIO_CONNECT_TIMEOUT_MS,
    "Gradio connect"
  );

  const result = await withTimeout(
    client.predict("/swap_faces", { src_img: srcBlob, dest_img: destBlob }),
    GRADIO_PREDICT_TIMEOUT_MS,
    "Gradio face-swap predict"
  );

  const url = result?.data?.[0]?.url;
  if (!url) throw new Error("Face-swap API returned no image URL");

  console.log(`${label} Face swap successful. Result URL: ${url.substring(0, 80)}...`);
  return url;
};

// ─── OpenAI image generation ──────────────────────────────────────────────────

/**
 * Generate a base outfit/scene image with OpenAI.
 * FIXED: null-check on client, model name mapping, correct gpt-image-2 params
 */
const generateBaseImage = async (prompt, selectedModel, sessionId = "unknown") => {
  const client = getOpenAIClient();
  const label  = `[AI Service][${sessionId}]`;

  // FIXED: explicit null check — prevents TypeError crash
  if (!client) {
    throw new Error("OpenAI client not initialized — check OPENAI_API_KEY environment variable");
  }

  // FIXED: map fake/unknown model IDs to real ones before sending to API
  const modelName = VALID_IMAGE_MODELS[selectedModel] || "gpt-image-1";
  const maxAttempts = 3;

  const PREFIX = "A hyper-realistic, ultra high-quality, 8K cinematic digital render of a fictional character.";
  const SUFFIX  = "The character is facing slightly forward with sharp focus on the face. Ultra-detailed textures, sharp eyes, realistic cinematic lighting. Masterpiece digital art. Do not add any text or watermarks.";

  let currentPrompt = prompt;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Only append the strict prefix/suffix on attempt 1.
    // On fallback attempts, we want to use the exactly sanitized or ultra-safe prompt without adding anything that could re-trigger safety filters.
    const fullPrompt = attempt === 1 
      ? `${PREFIX} ${currentPrompt}. ${SUFFIX}`
      : currentPrompt;

    console.log(`${label} Generating image — attempt ${attempt}/${maxAttempts} (model: ${modelName})`);
    console.log(`${label} Prompt: "${fullPrompt.substring(0, 120)}..."`);

    // FIXED: previous comment claiming gpt-image models reject size/quality
    // was WRONG. GPT-Image models (gpt-image-1, gpt-image-2, etc.) DO support
    // size and quality — they only reject response_format/style (DALL·E-only
    // params) and always return b64_json. Omitting `quality` was silently
    // defaulting to "auto" (~medium), which is the main cause of blurry output.
    const params = {
      model:  modelName,
      prompt: fullPrompt,
      n:      1,
    };

    if (modelName.startsWith("gpt-image")) {
      params.size    = "1024x1024"; // generate at a real resolution; we downscale to 512x512 later in Cloudinary for crisper results than generating natively small
      // [Performance Test] quality temporarily set to "low" for benchmarking —
      // was "high". Resolution (size) and n are UNCHANGED. Revert to "high"
      // once the benchmark run is complete.
      params.quality = "low";      // low | medium | high — benchmark test value
    } else if (modelName === "dall-e-3") {
      params.size    = "1024x1024";
      params.quality = "hd";
      params.style   = "natural";
    } else if (modelName === "dall-e-2") {
      params.size = "1024x1024";
    }

    // [Performance Test] capture generation start time
    const perfStart = Date.now();
    const perfStartISO = new Date(perfStart).toISOString();

    try {
      const response = await withTimeout(
        client.images.generate(params),
        OPENAI_TIMEOUT_MS,
        "OpenAI image generation"
      );

      // [Performance Test] capture generation end time / duration
      const perfEnd = Date.now();
      const perfEndISO = new Date(perfEnd).toISOString();
      const perfDurationSec = ((perfEnd - perfStart) / 1000).toFixed(2);

      const item = response?.data?.[0];
      if (!item) throw new Error("OpenAI returned an empty response");

      // Build stable data URI from b64_json (gpt-image-2) or use URL (dall-e-3/2)
      const imageUrl = item.b64_json
        ? `data:image/png;base64,${item.b64_json}`
        : item.url || null;

      if (!imageUrl) throw new Error("OpenAI response contained no image data");

      const { width, height } = await probeDimensions(imageUrl);
      console.log("OpenAI Output Resolution:", width, height);

      // [Performance Test] output file size — from b64_json bytes, or fetched
      // from the URL for dall-e-3/2 responses. Never throws.
      let outputFileSizeKB = "unknown";
      if (item.b64_json) {
        outputFileSizeKB = (Buffer.from(item.b64_json, "base64").length / 1024).toFixed(2);
      } else if (item.url) {
        try {
          const sizeRes = await fetch(item.url);
          const sizeBuf = Buffer.from(await sizeRes.arrayBuffer());
          outputFileSizeKB = (sizeBuf.length / 1024).toFixed(2);
        } catch (sizeErr) {
          console.warn(`${label} Could not determine output file size: ${sizeErr.message}`);
        }
      }

      // [Performance Test] structured benchmark log line
      console.log(
        `[Performance Test] Quality: ${params.quality || "default"} ` +
        `Resolution: ${params.size || "default"} ` +
        `Images: ${params.n} ` +
        `Generation Start: ${perfStartISO} ` +
        `Generation End: ${perfEndISO} ` +
        `Generation Duration: ${perfDurationSec} seconds ` +
        `Output Dimensions: ${width}x${height} ` +
        `Output File Size: ${outputFileSizeKB} KB`
      );

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

      console.error(`${label} Image generation failed on attempt ${attempt}: ${err.message}`);
      throw err;
    }
  }

  throw new Error(`${label} Image generation exhausted all ${maxAttempts} attempts`);
};

// ─── Main public API ──────────────────────────────────────────────────────────

/**
 * Full pipeline: generate → [cloudinary] → face-swap → [cloudinary] → enhance.
 *
 * FIXED:
 *   - OpenAI output (data URI or expiring URL) is uploaded to Cloudinary before face swap
 *   - Face-swap Gradio URL is uploaded to Cloudinary before enhancement
 *   - Both uploads prevent URL expiry failures mid-pipeline
 */
const generateFaceSwap = async (
  sourceImageUrl,
  targetTemplateUrl,
  prompt,
  selectedModel,
  sessionId = "unknown"
) => {
  const label        = `[AI Service][${sessionId}]`;
  const pipelineStart = Date.now();

  console.log(`\n${"=".repeat(80)}`);
  console.log(`${label} Starting face-swap pipeline`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  Mock mode: ${isMockMode()}`);
  console.log(`  OpenAI key configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`  HF token configured: ${!!process.env.HF_TOKEN}`);
  console.log(`${"=".repeat(80)}\n`);

  // ── Mock mode: skip OpenAI, swap face onto the raw template ──────────────
  if (isMockMode()) {
    console.log(`${label} MOCK MODE — swapping face onto template directly.`);
    try {
      const swappedUrl = await runFaceSwap(sourceImageUrl, targetTemplateUrl, label);

      // Upload to Cloudinary for stable URL before enhancement
      let stableSwappedUrl = swappedUrl;
      try {
        console.log(`${label} Uploading mock face-swap result to Cloudinary...`);
        stableSwappedUrl = await uploadImageFromUrl(swappedUrl);
        console.log(`${label} Cloudinary upload done: ${stableSwappedUrl}`);
      } catch (cdnErr) {
        console.warn(`${label} Cloudinary upload failed (using raw Gradio URL): ${cdnErr.message}`);
      }

      const enhancementResult = await enhanceImage(stableSwappedUrl);
      console.log(`${label} Enhancement result: method=${enhancementResult.method}, success=${enhancementResult.success}`);

      let finalMockUrl = enhancementResult.url;
      try {
        finalMockUrl = await uploadImageFromUrl(enhancementResult.url, {
          width: 512,
          height: 512,
          crop: "fill",
          gravity: "face",
        });
      } catch (resizeErr) {
        console.warn(`${label} 512x512 enforcement failed in mock mode: ${resizeErr.message}`);
      }
      const mockDims = await probeDimensions(finalMockUrl);
      console.log("Cloudinary Uploaded Resolution:", mockDims.width, mockDims.height);

      console.log(`${label} Total pipeline time: ${Date.now() - pipelineStart}ms\n`);

      return {
        imageUrl:    finalMockUrl,
        enhancement: enhancementResult,
      };

    } catch (err) {
      console.error(`${label} Mock face-swap failed: ${err.message}`);
      console.log(`${label} Total pipeline time: ${Date.now() - pipelineStart}ms\n`);

      return {
        imageUrl:    sourceImageUrl,
        enhancement: { method: "none", success: false, error: err.message },
      };
    }
  }

  // ── Step 1: Generate base image ───────────────────────────────────────────
  console.log(`${label} STEP 1: Generating base image via OpenAI...`);
  const generationStart = Date.now();
  let generatedImageUrl;

  try {
    generatedImageUrl = await generateBaseImage(prompt, selectedModel, sessionId);
    console.log(`${label} Step 1 complete in ${Date.now() - generationStart}ms`);
  } catch (err) {
    console.error(`${label} Step 1 failed: ${err.message}`);
    throw err;
  }

  // ── Step 1b: Upload OpenAI output to Cloudinary ───────────────────────────
  // CRITICAL FIX: OpenAI URLs expire after 1 hour, data URIs are huge blobs.
  // Upload to Cloudinary immediately for a stable, fast CDN URL.
  console.log(`${label} STEP 1b: Uploading generated image to Cloudinary...`);
  const cdnStart1 = Date.now();
  let stableGeneratedUrl = generatedImageUrl;

  try {
    if (generatedImageUrl.startsWith("data:")) {
      stableGeneratedUrl = await uploadImage(generatedImageUrl);
    } else {
      stableGeneratedUrl = await uploadImageFromUrl(generatedImageUrl);
    }
    console.log(`${label} Step 1b complete in ${Date.now() - cdnStart1}ms — ${stableGeneratedUrl}`);
  } catch (cdnErr) {
    // Non-fatal: continue with raw URL; face swap may still work if < 1hr
    console.warn(`${label} Step 1b (Cloudinary) failed — proceeding with raw URL: ${cdnErr.message}`);
  }

  // ── Step 2: Face swap ─────────────────────────────────────────────────────
  console.log(`${label} STEP 2: Swapping face onto generated image...`);
  const swapStart = Date.now();
  let faceSwapUrl;

  {
    const inputDims = await probeDimensions(stableGeneratedUrl);
    console.log("Face Swap Input Resolution:", inputDims.width, inputDims.height);
  }

  try {
    faceSwapUrl = await runFaceSwap(sourceImageUrl, stableGeneratedUrl, label);
    console.log(`${label} Step 2 complete in ${Date.now() - swapStart}ms`);

    const outputDims = await probeDimensions(faceSwapUrl);
    console.log("Face Swap Output Resolution:", outputDims.width, outputDims.height);
  } catch (err) {
    console.error(`${label} Step 2 failed: ${err.message}`);
    throw err;
  }

  // ── Step 2b: Upload face-swap result to Cloudinary ────────────────────────
  // CRITICAL FIX: Gradio URLs are temporary (minutes). Upload before enhancement
  // which can take 2–3 min on CodeFormer cold start.
  console.log(`${label} STEP 2b: Uploading face-swap result to Cloudinary...`);
  const cdnStart2 = Date.now();
  let stableFaceSwapUrl = faceSwapUrl;

  try {
    stableFaceSwapUrl = await uploadImageFromUrl(faceSwapUrl);
    console.log(`${label} Step 2b complete in ${Date.now() - cdnStart2}ms — ${stableFaceSwapUrl}`);
  } catch (cdnErr) {
    console.warn(`${label} Step 2b (Cloudinary) failed — proceeding with raw Gradio URL: ${cdnErr.message}`);
  }

  // ── Step 3: Enhance (SKIPPED TO REDUCE GENERATION TIME) ───────────────────
  console.log(`${label} STEP 3: Enhancing image skipped to reduce generation time...`);
  const enhancementResult = {
    url: stableFaceSwapUrl,
    method: 'skipped',
    success: true,
    timeMs: 0,
  };
  console.log(`${label} Enhancement: skipped for speed`);

  // ── Step 4: Force final output to EXACTLY 512x512 ─────────────────────────
  // Re-upload through Cloudinary with an exact-size transformation. This is
  // the ONLY place a forced resize happens — doing it once, at the very end,
  // on the highest-quality version we have, avoids compounding quality loss
  // from resizing multiple times mid-pipeline.
  console.log(`${label} STEP 4: Enforcing final 512x512 output via Cloudinary...`);
  let finalUrl = enhancementResult.url;
  try {
    finalUrl = await uploadImageFromUrl(enhancementResult.url, {
      width: 512,
      height: 512,
      crop: "fill",
      gravity: "face",
    });
  } catch (resizeErr) {
    console.warn(`${label} Step 4 (512x512 enforcement) failed — using unresized URL: ${resizeErr.message}`);
  }

  const finalDims = await probeDimensions(finalUrl);
  console.log("Cloudinary Uploaded Resolution:", finalDims.width, finalDims.height);

  console.log(`${label} FULL PIPELINE COMPLETE in ${Date.now() - pipelineStart}ms\n`);
  console.log(`${"=".repeat(80)}\n`);

  return {
    imageUrl:    finalUrl,
    enhancement: enhancementResult,
  };
};

module.exports = {
  generateFaceSwap,
  isMockMode,
  getOpenAIClient,
  getBlobFromImage,
};