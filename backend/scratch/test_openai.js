require("dotenv").config({ path: require('path').resolve(__dirname, "../.env") });
const { OpenAI } = require("openai");

async function testOpenAI() {
  console.log("Checking OpenAI API Key...");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("No OPENAI_API_KEY found in .env");
    return;
  }
  
  const client = new OpenAI({ apiKey });

  try {
    console.log("Attempting to generate a test image using dall-e-3 to check billing status...");
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: "A simple red apple on a white background",
      size: "1024x1024",
      n: 1,
    });
    console.log("SUCCESS! The API is working correctly. Generated image URL:");
    console.log(response.data[0].url);
  } catch (err) {
    console.error("API Error:", err.message);
  }
}

testOpenAI();
