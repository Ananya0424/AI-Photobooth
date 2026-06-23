async function run() {
  let attempts = 0;
  const maxAttempts = 15; // 15 * 10s = 2.5 minutes
  console.log('Starting polling for template update on Render...');
  
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch('https://ai-photobooth-bfen.onrender.com/api/templates/female').then(r => r.json());
      const formalWomen = res.templates.find(t => t.id === 'formal_women');
      console.log(`Poll ${attempts}: name = "${formalWomen.name}"`);
      if (formalWomen.name === 'Formal Suit & Glasses') {
        console.log('SUCCESS: The new template is live on Render!');
        return;
      }
    } catch (e) {
      console.log(`Poll ${attempts} error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 10000));
  }
  console.log('Timed out waiting for deploy. Please check Render dashboard.');
}
run();
