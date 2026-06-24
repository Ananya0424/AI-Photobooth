const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("Testing gpt-image-2 and printing full response...");
  try {
    const res = await openai.images.generate({
      model: "gpt-image-2",
      prompt: "A photorealistic portrait of an astronaut",
      n: 1,
      size: "512x512",
    });
    console.log("Full response:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

run();
