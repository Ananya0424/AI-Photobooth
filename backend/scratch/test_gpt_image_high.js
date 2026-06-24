const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("Testing gpt-image-2 with quality: 'high'...");
  try {
    const res = await openai.images.generate({
      model: "gpt-image-2",
      prompt: "A beautiful cat sitting on a throne",
      n: 1,
      size: "1024x1024",
      quality: "high",
    });
    console.log("✓ Success with quality: 'high'!", res.data[0] ? "Has data" : "No data");
  } catch (err) {
    console.error("✗ Failed:", err.message);
  }
}

run();
