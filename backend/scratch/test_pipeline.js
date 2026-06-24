const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });

const { generateFaceSwap } = require("../src/services/aiService");

const sourceImageUrl = "https://res.cloudinary.com/db2dzqdsx/image/upload/v1782194907/ai-photobooth/i3kdyzsfbmbtmxbwm5ky.jpg";
const targetTemplateUrl = "/assets/templates/female_astronaut.jpg";
const prompt = "TY is depicted as a realistic female astronaut, adorned in a highly detailed, modern space suit. Her helmet visor reflects a galaxy of stars. The suit's intricate textures glisten under cinematic space lighting, casting ethereal blue and silver hues. The portrait is captured in stunning 8k resolution, highlighting every stitch and metallic panel, creating a sense of awe and wonder.";
const selectedModel = "gpt-image-2";

async function run() {
  console.log("Running pipeline test...");
  try {
    const resultUrl = await generateFaceSwap(sourceImageUrl, targetTemplateUrl, prompt, selectedModel);
    console.log("Pipeline test completed successfully! Result URL:", resultUrl);
  } catch (err) {
    console.error("Pipeline test failed:", err);
  }
}

run();
