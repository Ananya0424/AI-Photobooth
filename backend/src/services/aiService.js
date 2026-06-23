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

const sanitizePromptForSafety = (prompt) => {
  if (!prompt) return "";
  return prompt
    .replace(/Captain Marvel-style/gi, "cosmic")
    .replace(/Captain Marvel/gi, "cosmic hero")
    .replace(/Iron Man-style/gi, "futuristic high-tech")
    .replace(/Iron Man/gi, "high-tech hero")
    .replace(/NASA logo/gi, "space badge")
    .replace(/NASA/gi, "space agency")
    .replace(/explosions/gi, "swirling colorful energy")
    .replace(/fire and debris/gi, "glowing light embers")
    .replace(/Destroyed city/gi, "futuristic city skyline")
    .replace(/battlefield/gi, "dramatic sky")
    .replace(/Avenger/gi, "superhero");
};

const getSuperSafeFallbackPrompt = (originalPrompt) => {
  const lowercasePrompt = (originalPrompt || "").toLowerCase();
  
  if (lowercasePrompt.includes("astronaut") || lowercasePrompt.includes("nasa") || lowercasePrompt.includes("space")) {
    return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing a highly detailed white space suit inside a spaceship, looking at the camera. Sharp focus, realistic lighting, studio quality.";
  }
  
  if (lowercasePrompt.includes("superhero") || lowercasePrompt.includes("avenger") || lowercasePrompt.includes("armor") || lowercasePrompt.includes("marvel") || lowercasePrompt.includes("iron")) {
    return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing high-tech futuristic metallic red and gold body armor, looking at the camera. Sharp focus, realistic lighting, studio quality.";
  }
  
  if (lowercasePrompt.includes("king") || lowercasePrompt.includes("queen") || lowercasePrompt.includes("crown") || lowercasePrompt.includes("tiara")) {
    return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing an ornate golden crown and royal robes, looking at the camera. Regal palace background, sharp focus, realistic lighting, studio quality.";
  }
  
  // Generic fallback if none matches
  return "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing formal business attire, looking at the camera. Office studio background, sharp focus, realistic lighting, studio quality.";
};

/**
 * Generate an image using OpenAI and swap the face, then enhance quality
 */
const generateFaceSwap = async (sourceImageUrl, targetTemplateUrl, prompt, selectedModel) => {
  console.log("[AI Service] Starting face-swap generation pipeline...");

  if (isMockMode()) {
    console.log("[AI Service] Running in MOCK MODE (no OpenAI API key configured). Swapping face onto template directly...");
    try {
      const srcBlob = await getBlobFromImage(sourceImageUrl);
      const destBlob = await getBlobFromImage(targetTemplateUrl);
      const client = await Client.connect("tonyassi/face-swap");
      const result = await client.predict("/swap_faces", {
        src_img: srcBlob,
        dest_img: destBlob
      });
      if (result && result.data && result.data[0] && result.data[0].url) {
        const faceSwapUrl = result.data[0].url;
        console.log("[AI Service] Mock face swap successful!");
        try {
          const enhancedUrl = await enhanceImage(faceSwapUrl);
          return enhancedUrl;
        } catch (enhanceError) {
          console.warn("[AI Service] Mock enhancement failed, returning face swap:", enhanceError.message);
          return faceSwapUrl;
        }
      } else {
        throw new Error("Unexpected response from face swap API");
      }
    } catch (err) {
      console.error("[AI Service] Mock face-swap failed:", err.message);
      return sourceImageUrl;
    }
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Step 1: Generate the base outfit/scene image using selected AI model
    const modelName = selectedModel || "gpt-image-2";
    const basePromptPart = `A photorealistic, ultra high-quality, 8K professional portrait photograph of a person.`;
    const endPromptPart = `The person is facing slightly forward with sharp focus on the face. Ultra-detailed skin texture, sharp eyes, realistic lighting. Studio quality photography. Do not add any text or watermarks.`;

    let generatedImageUrl;
    let currentPromptText = prompt;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      const imagePrompt = `${basePromptPart} ${currentPromptText}. ${endPromptPart}`;
      console.log(`[AI Service] Generating base image with model: ${modelName} (Attempt ${retryCount + 1}/${maxRetries + 1})...`);
      
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
          console.log(`[AI Service] Base image generated successfully using ${modelName} on attempt ${retryCount + 1}.`);
          break;
        } else {
          throw new Error("Unexpected OpenAI API response format");
        }
      } catch (openaiError) {
        console.error(`[AI Service] OpenAI generation attempt ${retryCount + 1} failed:`, openaiError.message);
        
        const isSafety = openaiError.message.toLowerCase().includes("safety") || 
                         openaiError.message.toLowerCase().includes("policy") || 
                         openaiError.message.toLowerCase().includes("rejected") ||
                         openaiError.message.toLowerCase().includes("content_policy_violation");

        if (isSafety && retryCount < maxRetries) {
          retryCount++;
          if (retryCount === 1) {
            console.warn("[AI Service] Safety system rejection. Retrying with sanitized prompt...");
            currentPromptText = sanitizePromptForSafety(currentPromptText);
          } else if (retryCount === 2) {
            console.warn("[AI Service] Safety system rejection again. Retrying with ultra-safe generic fallback prompt...");
            currentPromptText = getSuperSafeFallbackPrompt(prompt);
          }
        } else {
          throw new Error(`OpenAI image generation failed: ${openaiError.message}`);
        }
      }
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
