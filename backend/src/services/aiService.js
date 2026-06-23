const { OpenAI } = require("openai");
const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");
const { enhanceImage } = require("./imageEnhancer");

/**
 * AI Service for image generation using OpenAI and Gradio Face Swap
 * Pipeline: Template Image → Face Swap → Face Restoration → Upload
 */

const isMockMode = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  return (
    !apiKey ||
    apiKey === "your_openai_api_key_here" ||
    apiKey === "" ||
    apiKey.startsWith("sk-proj-your_")
  );
};

const getBlobFromImage = async (imageInput) => {
  if (imageInput.startsWith("data:")) {
    const res = await fetch(imageInput);
    return await res.blob();
  } else if (imageInput.startsWith("/assets/")) {
    // Resolve local path from frontend/public
    const filePath = path.join(__dirname, "../../../frontend/public", imageInput);
    const buffer = fs.readFileSync(filePath);
    const mime = imageInput.endsWith(".png") ? "image/png" : "image/jpeg";
    return new Blob([buffer], { type: mime });
  } else {
    const res = await fetch(imageInput);
    if (!res.ok) throw new Error(`Failed to fetch image from ${imageInput}`);
    return await res.blob();
  }
};

/**
 * Generate an image using OpenAI and swap the face, then enhance quality
 */
const generateFaceSwap = async (sourceImageUrl, targetTemplateUrl, prompt, selectedModel) => {
  console.log("[AI Service] Starting face-swap generation pipeline...");

  if (isMockMode()) {
    console.log("[AI Service] Running in MOCK MODE (no OpenAI API key configured)");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return targetTemplateUrl || sourceImageUrl;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Step 1: Generate the base outfit/scene image using selected AI model
    const modelName = selectedModel || "gpt-image-2";
    console.log(`[AI Service] Generating base image with model: ${modelName}...`);
    const imagePrompt = `A photorealistic, ultra high-quality, 8K professional portrait photograph of a person. ${prompt}. The person is facing slightly forward with sharp focus on the face. Ultra-detailed skin texture, sharp eyes, realistic lighting. Studio quality photography. Do not add any text or watermarks.`;
    
    let generatedImageUrl;
    try {
      const imageParams = {
        model: modelName,
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      };

      // Model-specific overrides
      if (modelName === "dall-e-3") {
        imageParams.quality = "hd";
        imageParams.style = "natural";
      }

      const response = await openai.images.generate(imageParams);

      if (response && response.data && response.data[0]) {
        generatedImageUrl = response.data[0].url || `data:image/png;base64,${response.data[0].b64_json}`;
        console.log(`[AI Service] Base image generated successfully using ${modelName}.`);
      } else {
        throw new Error("Unexpected OpenAI API response format");
      }
    } catch (openaiError) {
      console.error("[AI Service] OpenAI generation failed:", openaiError.message);
      console.log("[AI Service] Falling back to the template image as the target.");
      generatedImageUrl = targetTemplateUrl; // Fallback to template if DALL-E fails
    }

    if (!generatedImageUrl) {
      throw new Error("No target image available for face swap");
    }

    // Step 2: Swap the user's face onto the target image
    console.log("[AI Service] Swapping face using tonyassi/face-swap...");
    
    const srcBlob = await getBlobFromImage(sourceImageUrl);
    const destBlob = await getBlobFromImage(generatedImageUrl);

    const client = await Client.connect("tonyassi/face-swap");
    const result = await client.predict("/swap_faces", {
      src_img: srcBlob,
      dest_img: destBlob
    });

    let faceSwapUrl;
    if (result && result.data && result.data[0] && result.data[0].url) {
      faceSwapUrl = result.data[0].url;
      console.log("[AI Service] Face swap successful!");
    } else {
      throw new Error("Unexpected response from face swap API");
    }

    // Step 3: Enhance the face-swapped image (face restoration + upscaling)
    console.log("[AI Service] Enhancing image quality (face restoration + upscaling)...");
    try {
      const enhancedUrl = await enhanceImage(faceSwapUrl);
      console.log("[AI Service] Image enhancement completed successfully!");
      return enhancedUrl;
    } catch (enhanceError) {
      console.warn("[AI Service] Enhancement failed, returning face-swapped image:", enhanceError.message);
      return faceSwapUrl; // Return unenhanced face swap if enhancement fails
    }

  } catch (error) {
    console.error("[AI Service] Error in generation/face-swap:", error.message);
    throw error;
  }
};

module.exports = {
  generateFaceSwap,
  isMockMode,
};
