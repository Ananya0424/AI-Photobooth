const BASE_URL = 'http://localhost:5000/api';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log("Starting local generation test...");
  try {
    // 1. Create session
    const sessionRes = await fetch(BASE_URL + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'TestUser' })
    }).then(r => r.json());
    
    const sessionId = sessionRes.sessionId;
    console.log("Created session:", sessionId);

    // 2. Select Gender
    await fetch(BASE_URL + `/sessions/${sessionId}/gender`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: 'male' })
    });
    console.log("Selected gender: male");

    // 3. Select Template
    await fetch(BASE_URL + `/sessions/${sessionId}/template`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'male_astronaut' })
    });
    console.log("Selected template: male_astronaut");

    // 4. Capture (dummy face)
    const faceUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=256&h=256&q=80';
    const faceRes = await fetch(faceUrl);
    const faceBlob = await faceRes.blob();
    const faceBuffer = Buffer.from(await faceBlob.arrayBuffer());
    const faceBase64 = `data:image/jpeg;base64,${faceBuffer.toString('base64')}`;

    console.log("Triggering capture...");
    const captureRes = await fetch(BASE_URL + `/sessions/${sessionId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: faceBase64 })
    }).then(r => r.json());

    console.log("Capture response:", captureRes);

    // 5. Poll status
    for (let i = 1; i <= 60; i++) {
      await sleep(3000);
      const statusRes = await fetch(BASE_URL + `/sessions/${sessionId}/status`).then(r => r.json());
      console.log(`Poll #${i}: status=${statusRes.status}`);
      if (statusRes.status === 'completed') {
        console.log("✓ Session completed!");
        console.log("Raw User Image URL:", statusRes.rawUserImageUrl);
        console.log("Generated Image URL:", statusRes.generatedImageUrl);
        const isOriginal = statusRes.rawUserImageUrl === statusRes.generatedImageUrl;
        console.log("Is output same as original image?", isOriginal ? "⚠️ YES (Issue!)" : "✅ NO (Correct)");
        break;
      } else if (statusRes.status === 'failed') {
        console.error("✗ Session failed! Error:", statusRes.error);
        break;
      }
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

run();
