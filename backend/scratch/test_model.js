require("dotenv").config({ path: require('path').resolve(__dirname, "../.env") });
const { OpenAI } = require("openai");

async function test() {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: "A simple red apple",
      n: 1,
    });
    console.log("Success:", response.data[0]);
  } catch (err) {
    console.error("Error generating with gpt-image-1:", err.message);
  }
}
test();
