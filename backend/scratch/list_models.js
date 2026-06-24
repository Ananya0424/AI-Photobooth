const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const list = await openai.models.list();
    const models = list.data.map(m => m.id).sort();
    console.log("Available models:");
    console.log(models);
    console.log("Includes dall-e-3:", models.includes("dall-e-3"));
    console.log("Includes dall-e-2:", models.includes("dall-e-2"));
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}

run();
