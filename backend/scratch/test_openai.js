const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  console.log("Testing DALL-E 3 image generation with style: 'natural'...");
  try {
    const res1 = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A beautiful cat sitting on a throne",
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });
    console.log("✓ Success with style parameter:", res1.data[0].url);
  } catch (err) {
    console.error("✗ Failed with style parameter:", err.message);
  }

  console.log("Testing DALL-E 3 image generation WITHOUT style parameter...");
  try {
    const res2 = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A beautiful cat sitting on a throne",
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });
    console.log("✓ Success WITHOUT style parameter:", res2.data[0].url);
  } catch (err) {
    console.error("✗ Failed WITHOUT style parameter:", err.message);
  }
}

run();
