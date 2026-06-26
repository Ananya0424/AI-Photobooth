const { OpenAI } = require("openai");
require("dotenv").config({ path: require('path').resolve(__dirname, "../.env") });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  const PREFIX = "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person.";
  const SUFFIX  = "The person is facing slightly forward with sharp focus on the face. Ultra-detailed skin texture, sharp eyes, realistic lighting. Studio quality photography. Do not add any text or watermarks.";
  
  const currentPrompt = "A photorealistic, ultra high-quality, 8K professional portrait photograph of a person wearing formal business attire, looking at the camera. Office studio background, sharp focus, realistic lighting, studio quality.";
  
  const fullPrompt = `${PREFIX} ${currentPrompt}. ${SUFFIX}`;
  console.log("Prompt:", fullPrompt);
  
  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    });
    console.log("Success!", response.data[0].url);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
