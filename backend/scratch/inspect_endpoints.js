const { Client } = require("@gradio/client");

async function run() {
  try {
    const client = await Client.connect("sczhou/CodeFormer");
    console.log(JSON.stringify(client.config.dependencies[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
