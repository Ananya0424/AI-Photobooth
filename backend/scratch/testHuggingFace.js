const path = require('path');
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { generateFaceSwap } = require("../src/services/aiService");

async function test() {
  console.log("Testing Hugging Face Face Swap API...");
  // Using public URLs for testing
  const sourceImage = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png";
  const targetImage = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png";
  
  try {
    const result = await generateFaceSwap(sourceImage, targetImage, "test prompt");
    console.log("SUCCESS! Result URL:", result);
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();
