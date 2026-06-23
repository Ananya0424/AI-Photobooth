const { OpenAI } = require("openai");
const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");

/**
 * AI Service for image generation using OpenAI and Gradio Face Swap
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
 * Generate an image using OpenAI and swap the face
 */
const generateFaceSwap = async (sourceImageUrl, targetTemplateUrl, prompt, selectedModel) => {
  console.log("[AI Service] Starting true face-swap generation...");

  if (isMockMode()) {
    console.log("[AI Service] Running in MOCK MODE (no OpenAI API key configured)");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return sourceImageUrl;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Step 1: Generate the base outfit/scene image using DALL-E 3
    console.log("[AI Service] Generating base image with DALL-E 3...");
    const imagePrompt = `A photorealistic, high-quality portrait of a person. ${prompt}. Ensure the person is facing forward. Do not add any text.`;
    
    let generatedImageUrl;
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      if (response && response.data && response.data[0]) {
        generatedImageUrl = response.data[0].url || `data:image/png;base64,${response.data[0].b64_json}`;
        console.log(`[AI Service] Base image generated successfully.`);
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

    if (result && result.data && result.data[0] && result.data[0].url) {
      console.log("[AI Service] Face swap successful!");
      return result.data[0].url;
    } else {
      throw new Error("Unexpected response from face swap API");
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
