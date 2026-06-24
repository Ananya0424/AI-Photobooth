const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testParams(label, params) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log(`Testing: ${label}`);
  try {
    const res = await openai.images.generate(params);
    console.log(`✓ SUCCESS for ${label}:`, res.data[0].url);
    return true;
  } catch (err) {
    console.error(`✗ FAILED for ${label}:`, err.message);
    return false;
  }
}

async function run() {
  // Test 1: model, prompt, size
  await testParams("Basic parameters (model, prompt, size)", {
    model: "gpt-image-2",
    prompt: "A photorealistic portrait of an astronaut",
    n: 1,
    size: "512x512"
  });

  // Test 2: model, prompt, size, quality
  await testParams("With quality parameter", {
    model: "gpt-image-2",
    prompt: "A photorealistic portrait of an astronaut",
    n: 1,
    size: "512x512",
    quality: "hd"
  });
}

run();
