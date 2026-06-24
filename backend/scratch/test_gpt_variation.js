const { OpenAI, toFile } = require("openai");
const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("Downloading a test image...");
  try {
    const imageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=256&h=256&q=80";
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Convert to a File object for the OpenAI SDK
    const file = await toFile(buffer, "image.png");

    console.log("Testing Variation API without model parameter (default)...");
    try {
      const res = await openai.images.createVariation({
        image: file,
        n: 1,
        size: "256x256"
      });
      console.log("✓ Success (default):", res.data[0].url);
    } catch (err) {
      console.error("✗ Failed (default):", err.message);
    }

    console.log("Testing Variation API with model: 'gpt-image-2'...");
    try {
      const res = await openai.images.createVariation({
        model: "gpt-image-2",
        image: file,
        n: 1,
        size: "256x256"
      });
      console.log("✓ Success (gpt-image-2):", res.data[0].url);
    } catch (err) {
      console.error("✗ Failed (gpt-image-2):", err.message);
    }

  } catch (err) {
    console.error("Setup failed:", err.message);
  }
}

run();
