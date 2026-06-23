const { OpenAI } = require("openai");

/**
 * Maps selected settings models (including futuristic mock ones)
 * to real existing OpenAI model IDs.
 */
const mapToChatModel = (modelId) => {
  const mapping = {
    "gpt-image-2": "gpt-4o",
    "gpt-image-2-2026-04-21": "gpt-4o",
    "gpt-image-1.5": "gpt-4o"
  };
  return mapping[modelId] || "gpt-4o";
};

/**
 * Enhances the base template prompt using the selected OpenAI model.
 * If the OpenAI API key is missing or invalid, falls back to the base prompt.
 * 
 * @param {string} modelId - The selected model ID (e.g., 'gpt-image-2')
 * @param {string} basePrompt - The base style prompt of the selected template
 * @param {string} userName - The name of the user
 * @param {string} gender - The selected gender
 * @returns {Promise<string>} The enhanced prompt
 */
const enhancePrompt = async (modelId, basePrompt, userName, gender) => {
  const apiKey = process.env.OPENAI_API_KEY;

  // If no OpenAI API key is set, skip and return base prompt
  if (!apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "") {
    console.log("[OpenAI Service] No API key configured. Using base template prompt.");
    return basePrompt;
  }

  try {
    const realModel = mapToChatModel(modelId);
    console.log(`[OpenAI Service] Enhancing prompt using model: ${realModel} (selected: ${modelId})...`);

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: realModel,
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineer for photorealistic AI portrait generation. Your task is to take a base style prompt and enhance it into a highly detailed, ultra-photorealistic portrait description. Focus on: sharp facial features, detailed skin textures, realistic eye reflections, high-end studio lighting, cinematic color grading, 8K resolution quality, DSLR-like depth of field, and professional photography aesthetics. Keep the output concise (under 100 words) and return ONLY the final prompt without any extra conversation or quotes. Always emphasize: ultra sharp focus, hyper-detailed, photorealistic, professional studio photography."
        },
        {
          role: "user",
          content: `User Name: ${userName}, Gender: ${gender}, Base Style Prompt: ${basePrompt}`
        }
      ],
      max_tokens: 200,
      temperature: 0.6
    });

    const enhanced = completion.choices[0]?.message?.content?.trim();
    if (enhanced) {
      console.log(`[OpenAI Service] Successfully generated enhanced prompt: "${enhanced.substring(0, 100)}..."`);
      return enhanced;
    }
    
    return basePrompt;
  } catch (error) {
    console.error("[OpenAI Service] Error generating prompt with OpenAI:", error.message);
    return basePrompt; // Fallback to base prompt on error
  }
};

module.exports = {
  enhancePrompt
};
