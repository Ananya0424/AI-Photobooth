const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");

async function run() {
  console.log("Connecting to CodeFormer...");
  try {
    const client = await Client.connect("sczhou/CodeFormer");
    
    // Load local file
    const filePath = path.join(__dirname, "latest_female_astronaut.jpg");
    console.log("Loading file:", filePath);
    const buffer = fs.readFileSync(filePath);
    const imageBlob = new Blob([buffer], { type: "image/jpeg" });

    console.log("Calling /inference endpoint with positional parameters...");
    const result = await client.predict("/inference", [
      imageBlob, // Input image
      true,      // Pre_Face_Align
      true,      // Background_Enhance
      true,      // Face_Upsample
      2,         // Rescaling_Factor
      0.7        // Codeformer_Fidelity
    ]);

    console.log("✓ Success! Output result:");
    console.log(JSON.stringify(result.data, null, 2));
  } catch (err) {
    console.error("✗ Failed:", err.message || err);
  }
}

run();
