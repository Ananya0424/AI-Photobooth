const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("Testing gpt-image-2 generation...");
  try {
    const res = await openai.images.generate({
      model: "gpt-image-2",
      prompt: "A beautiful cinematic digital painting of a futuristic astronaut, photorealistic, 8k",
      n: 1,
      size: "1024x1024",
    });
    console.log("✓ Success with gpt-image-2:", res.data[0].url);
  } catch (err) {
    console.error("✗ Failed with gpt-image-2:", err.message);
  }
}

run();
