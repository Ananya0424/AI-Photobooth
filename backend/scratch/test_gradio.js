const { Client } = require("@gradio/client");

async function checkSpace(spaceName) {
  console.log(`Connecting to Hugging Face Space: ${spaceName}...`);
  try {
    const client = await Client.connect(spaceName);
    console.log(`✓ Successfully connected to ${spaceName}`);
    return true;
  } catch (err) {
    console.error(`✗ Error connecting to ${spaceName}:`, err.message || err);
    return false;
  }
}

async function run() {
  await checkSpace("tonyassi/face-swap");
  await checkSpace("sczhou/CodeFormer");
  await checkSpace("Xintao/GFPGAN");
  await checkSpace("nightfury/GFPGAN");
}

run();
