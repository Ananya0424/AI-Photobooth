const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");

async function run() {
  try {
    console.log("Connecting to Hugging Face space...");
    const client = await Client.connect("tonyassi/face-swap");
    console.log("Connected successfully!");

    // Read source and target files
    const srcPath = path.join(__dirname, "../../../frontend/public/assets/templates/formal_women.jpg");
    const destPath = path.join(__dirname, "../../../frontend/public/assets/templates/formal_suit.jpg");

    console.log("Reading source image...");
    const srcBuffer = fs.readFileSync(srcPath);
    const srcBlob = new Blob([srcBuffer], { type: "image/jpeg" });

    console.log("Reading target image...");
    const destBuffer = fs.readFileSync(destPath);
    const destBlob = new Blob([destBuffer], { type: "image/jpeg" });

    console.log("Sending prediction request...");
    const result = await client.predict("/swap_faces", {
      src_img: srcBlob,
      dest_img: destBlob
    });

    console.log("Prediction complete!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Failed:", error.message, error.stack);
  }
}

run();
