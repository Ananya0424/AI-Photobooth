const Replicate = require("replicate");

/**
 * AI Service for identity-preserving portrait generation
 *
 * Supports two modes:
 * 1. MOCK MODE: When REPLICATE_API_TOKEN is not set or is a placeholder,
 *    returns the source image after a simulated delay (for local development).
 * 2. REAL MODE: Uses Replicate API to connect to an InstantID model
 *    for identity preservation + outfit/background transformation.
 */

const isMockMode = () => {
  const token = process.env.REPLICATE_API_TOKEN;
  return (
    !token ||
    token === "your_replicate_token_here" ||
    token === "" ||
    !token.startsWith("r8_") // Replicate tokens start with r8_
  );
};

/**
 * Generate a portrait preserving user's face using AI
 * @param {string} sourceImageUrl - URL of the user's captured photo (source face)
 * @param {string} targetTemplateUrl - URL of the target template image (kept for compatibility)
 * @param {string} prompt - Text prompt describing the desired outfit and background
 * @returns {Promise<string>} URL of the generated portrait
 */
const generateFaceSwap = async (sourceImageUrl, targetTemplateUrl, prompt) => {
  console.log("[AI Service] Starting portrait generation via Replicate...");
  console.log(`[AI Service] Source image: ${sourceImageUrl}`);
  console.log(`[AI Service] Prompt: ${prompt}`);

  // ===== MOCK MODE =====
  if (isMockMode()) {
    console.log("[AI Service] Running in MOCK MODE (no API token configured)");
    console.log("[AI Service] Simulating processing delay...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return sourceImageUrl;
  }

  // ===== REAL MODE - Replicate API =====
  console.log("[AI Service] Running in REAL MODE with Replicate API");

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const AI_TIMEOUT_MS = 60000; // 60 second timeout

  try {
    const resultUrl = await Promise.race([
      (async () => {
        console.log("[AI Service] Sending request to Replicate (InstantID)...");

        // Using zsxkib/instant-id which excels at identity preservation + prompt-based stylization
        const output = await replicate.run(
          "zsxkib/instant-id:6af8583c541261472e92155d87bba80d5ad98461665802f2ba196ac099aaedc9",
          {
            input: {
              image: sourceImageUrl,
              prompt: prompt,
              negative_prompt: "ugly, malformed, low quality, bad anatomy, bad proportions, blurry, cloned face, missing fingers",
              enhance_face_region: true,
              image_prompt_strength: 0.8
            }
          }
        );

        console.log("[AI Service] Replicate API response received");

        // Replicate usually returns an array of URLs for image models
        if (Array.isArray(output) && output.length > 0) {
          return output[0];
        } else if (typeof output === 'string') {
          return output;
        }

        throw new Error("Unexpected output format from Replicate");
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timed out after 60 seconds")), AI_TIMEOUT_MS)
      ),
    ]);

    console.log(`[AI Service] Generated image URL: ${resultUrl}`);
    return resultUrl;
  } catch (error) {
    console.error("[AI Service] Replicate API error:", error.message);
    console.warn("[AI Service] Falling back to source image due to API error");
    return sourceImageUrl;
  }
};

module.exports = {
  // Keeping the exported name `generateFaceSwap` so `sessionController.js` doesn't break
  generateFaceSwap, 
  isMockMode,
};
