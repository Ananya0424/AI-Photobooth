const { generateFaceSwap } = require("../src/services/aiService");

// Force mock mode by clearing the API key
process.env.OPENAI_API_KEY = "";

const sourceImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=256&h=256&q=80";
const targetTemplateUrl = "/assets/templates/male_astronaut.jpg";

async function run() {
  console.log("Testing aiService mock mode...");
  try {
    const resultUrl = await generateFaceSwap(
      sourceImageUrl,
      targetTemplateUrl,
      "Test prompt",
      "gpt-image-2"
    );
    console.log("Mock pipeline completed.");
    console.log("Result URL:", resultUrl);
    console.log("Source URL:", sourceImageUrl);
    if (resultUrl === sourceImageUrl) {
      console.log("✅ SUCCESS: Mock mode correctly returned the original user uploaded photo.");
    } else {
      console.error("❌ FAILURE: Mock mode returned the template or another incorrect image.");
    }
  } catch (err) {
    console.error("Test failed with error:", err.message);
  }
}

run();
