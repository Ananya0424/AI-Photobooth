const { Client } = require("@gradio/client");

async function run() {
  console.log("Connecting to sczhou/CodeFormer...");
  try {
    const client = await Client.connect("sczhou/CodeFormer");
    console.log("Connected! Client config:");
    // Print all endpoints
    const view = client.config.dependencies;
    view.forEach((dep, idx) => {
      console.log(`Endpoint #${idx}: api_name: ${dep.api_name}, show_api: ${dep.show_api}`);
      if (dep.inputs) {
        console.log("  Inputs:");
        dep.inputs.forEach(input => {
          console.log(`    - name: ${input.name}, type: ${input.type}`);
        });
      }
      if (dep.outputs) {
        console.log("  Outputs:");
        dep.outputs.forEach(output => {
          console.log(`    - name: ${output.name}, type: ${output.type}`);
        });
      }
    });
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}

run();
