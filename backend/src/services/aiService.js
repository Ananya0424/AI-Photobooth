/**
 * AI Service for face-swap generation
 *
 * Supports two modes:
 * 1. MOCK MODE: When HUGGING_FACE_API_TOKEN is not set or is a placeholder,
 *    returns the source image after a simulated delay (for local development).
 * 2. REAL MODE: Uses @gradio/client to connect to a Hugging Face Space
 *    for actual face-swap processing.
 */

/**
 * Check if we are running in mock mode
 * @returns {boolean}
 */
const isMockMode = () => {
  const token = process.env.HUGGING_FACE_API_TOKEN;
  return (
    !token ||
    token === "hf_your_token_here" ||
    token === "" ||
    token.startsWith("hf_your_")
  );
};

/**
 * Generate a face-swapped image using AI
 * @param {string} sourceImageUrl - URL of the user's captured photo (source face)
 * @param {string} targetTemplateUrl - URL of the target template image (body/outfit)
 * @param {string} prompt - Text prompt describing the desired output
 * @returns {Promise<string>} URL of the generated/face-swapped image
 */
const generateFaceSwap = async (sourceImageUrl, targetTemplateUrl, prompt) => {
  console.log("[AI Service] Starting face-swap generation...");
  console.log(`[AI Service] Source image: ${sourceImageUrl}`);
  console.log(`[AI Service] Target template: ${targetTemplateUrl}`);
  console.log(`[AI Service] Prompt: ${prompt}`);

  // ===== MOCK MODE =====
  if (isMockMode()) {
    console.log("[AI Service] Running in MOCK MODE (no API token configured)");
    console.log("[AI Service] Simulating 2-second processing delay...");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("[AI Service] Mock generation complete. Returning source image as result.");
    return sourceImageUrl;
  }

  // ===== REAL MODE - Hugging Face Space via @gradio/client =====
  console.log("[AI Service] Running in REAL MODE with Hugging Face API");

  const AI_TIMEOUT_MS = 60000; // 60 second timeout

  try {
    // Wrap the entire AI call in a timeout
    const result = await Promise.race([
      (async () => {
        const { Client } = await import("@gradio/client");

        const hfToken = process.env.HUGGING_FACE_API_TOKEN;

        // Connect to a face-swap Gradio Space on Hugging Face
        console.log("[AI Service] Connecting to Hugging Face Space...");
        const client = await Client.connect("felixrosberg/face-swap", {
          hf_token: hfToken,
        });

        console.log("[AI Service] Connected to Hugging Face Space");

        // Fetch the source and target images as blobs
        const sourceResponse = await fetch(sourceImageUrl);
        const sourceBlob = await sourceResponse.blob();

        // Ensure target URL is absolute for Node.js fetch
        let absoluteTargetUrl = targetTemplateUrl;
        if (targetTemplateUrl.startsWith("/")) {
          absoluteTargetUrl = `http://localhost:5173${targetTemplateUrl}`;
        }

        const targetResponse = await fetch(absoluteTargetUrl);
        const targetBlob = await targetResponse.blob();

        console.log("[AI Service] Sending images to face-swap API...");

        // Call the face-swap prediction endpoint
        const predictionResult = await client.predict("/run_inference", {
          source_img: sourceBlob,
          target_img: targetBlob,
        });

        console.log("[AI Service] Face-swap API response received");
        return predictionResult;
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timed out after 60 seconds")), AI_TIMEOUT_MS)
      ),
    ]);

    // Extract the result image URL
    if (result && result.data && result.data[0]) {
      const generatedImageUrl = result.data[0].url || result.data[0];
      console.log(`[AI Service] Generated image URL: ${generatedImageUrl}`);
      return generatedImageUrl;
    }

    // If the API response format is unexpected, fall back to source image
    console.warn("[AI Service] Unexpected API response format, falling back to source image");
    return sourceImageUrl;
  } catch (error) {
    console.error("[AI Service] Face-swap API error:", error.message);
    console.warn("[AI Service] Falling back to source image due to API error");

    // Graceful degradation: return source image if API fails
    return sourceImageUrl;
  }
};

module.exports = {
  generateFaceSwap,
  isMockMode,
};
