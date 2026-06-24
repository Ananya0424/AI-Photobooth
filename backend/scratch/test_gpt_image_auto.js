const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testQuality(qualityVal) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log(`Testing gpt-image-2 with quality: '${qualityVal}'...`);
  const start = Date.now();
  try {
    const res = await openai.images.generate({
      model: "gpt-image-2",
      prompt: "A beautiful cat sitting on a throne",
      n: 1,
      size: "512x512",
      quality: qualityVal,
    });
    console.log(`✓ Success with quality '${qualityVal}' in ${Date.now() - start}ms!`);
  } catch (err) {
    console.error(`✗ Failed with quality '${qualityVal}':`, err.message);
  }
}

async function run() {
  await testQuality("auto");
  await testQuality("medium");
}

run();
