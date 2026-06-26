require("dotenv").config({ path: require('path').resolve(__dirname, "../.env") });
const { enhancePrompt } = require("../src/services/openaiService");

async function test() {
  const baseStyle = "Transform the user into a powerful cosmic superhero wearing detailed red, blue and gold armor with a glowing chest emblem. Dramatic sky background with colorful swirling stellar energy and light rays. Cinematic dramatic lighting, sharp facial features, detailed skin texture, flowing hair, ultra sharp focus, 8K, professional photography.";
  
  const enhanced = await enhancePrompt("gpt-image-2", baseStyle, "Ananya", "female");
  console.log("Enhanced Prompt:", enhanced);
}

test();
