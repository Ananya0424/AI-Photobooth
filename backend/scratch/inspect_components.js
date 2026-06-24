const { Client } = require("@gradio/client");

async function run() {
  try {
    const client = await Client.connect("sczhou/CodeFormer");
    const ids = [5, 6, 7, 8, 9, 10, 14, 15];
    client.config.components.forEach(c => {
      if (ids.includes(c.id)) {
        console.log(`Component #${c.id}: type: ${c.type}, label: ${c.props?.label}, props: ${JSON.stringify(c.props)}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

run();
