const { OpenAI } = require("openai");

/**
 * OpenAI Service — prompt enhancement via Chat Completions.
 *
 * FIXES in this version:
 *   - Fake/futuristic model IDs (gpt-image-2-2026-04-21, gpt-image-1.5) are
 *     documented clearly. They are ONLY valid as UI labels — they must NEVER
 *     be passed to the OpenAI Images API directly. The image model mapping
 *     now lives in aiService.js (VALID_IMAGE_MODELS). This file handles ONLY
 *     chat completion for prompt enhancement.
 *   - mapToChatModel is now separate from image model mapping to avoid confusion.
 *   - Added note so future developers don't accidentally pass these fake IDs
 *     to client.images.generate().
 */

/**
 * Maps ANY model ID (real or UI-facing fake) to a real Chat Completion model.
 * These IDs are image generation model IDs — they're all mapped to gpt-4o
 * for the purpose of TEXT prompt enhancement only.
 *
 * DO NOT use these to call client.images.generate() — that mapping is in
 * aiService.js (VALID_IMAGE_MODELS).
 */
const mapToChatModel = (modelId) => {
  const mapping = {
    "gpt-image-2":            "gpt-4o",
    "gpt-image-2-2026-04-21": "gpt-4o", // fake UI label → real chat model
    "gpt-image-1.5":          "gpt-4o", // fake UI label → real chat model
    "dall-e-3":               "gpt-4o",
    "dall-e-2":               "gpt-4o",
  };
  return mapping[modelId] || "gpt-4o";
};

/**
 * Enhances the base template prompt using the selected OpenAI model.
 * If the OpenAI API key is missing or invalid, falls back to the base prompt.
 *
 * @param {string} modelId    The selected model ID (e.g. 'gpt-image-2')
 * @param {string} basePrompt The base style prompt of the selected template
 * @param {string} userName   The name of the user
 * @param {string} gender     The selected gender
 * @returns {Promise<string>} The enhanced prompt
 */
const enhancePrompt = async (modelId, basePrompt, userName, gender) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "") {
    console.log("[OpenAI Service] No API key configured. Using base template prompt.");
    return basePrompt;
  }

  try {
    const chatModel = mapToChatModel(modelId);
    console.log(
      `[OpenAI Service] Enhancing prompt using chat model: ${chatModel} (selected image model: ${modelId})...`
    );

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an expert prompt engineer for DALL-E 3.
    You will receive a base style description.
    Your job is to rewrite the prompt to be highly detailed, cinematic, and optimized for an AI image generator.
    Do NOT include any specific names or real people in the prompt, as this triggers safety filters.
    Make it highly descriptive, focusing on lighting, textures, and composition. Keep it under 100 words.`;

    const completion = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        {
          role:    "system",
          content: systemPrompt,
        },
        {
          role:    "user",
          content: `Gender: ${gender}, Base Style Prompt: ${basePrompt}`,
        },
      ],
      max_tokens:  200,
      temperature: 0.6,
    });

    const enhanced = completion.choices[0]?.message?.content?.trim();
    if (enhanced) {
      console.log(
        `[OpenAI Service] Enhanced prompt: "${enhanced.substring(0, 100)}..."`
      );
      return enhanced;
    }

    return basePrompt;
  } catch (error) {
    console.error("[OpenAI Service] Error generating prompt:", error.message);
    return basePrompt;
  }
};

module.exports = {
  enhancePrompt,
};