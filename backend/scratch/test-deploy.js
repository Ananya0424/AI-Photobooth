const BASE_URL = 'https://ai-photobooth-bfen.onrender.com/api';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTest() {
  try {
    console.log('1. Creating session...');
    const sessionRes = await fetch(BASE_URL + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'TestUser' })
    }).then(r => r.json());
    console.log('Session Created:', sessionRes);

    const sessionId = sessionRes.sessionId;
    if (!sessionId) throw new Error('No session ID received');

    console.log('2. Selecting gender...');
    await fetch(BASE_URL + `/sessions/${sessionId}/gender`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: 'female' })
    }).then(r => r.json());

    console.log('3. Selecting template...');
    await fetch(BASE_URL + `/sessions/${sessionId}/template`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'formal_women' })
    }).then(r => r.json());

    console.log('4. Fetching real female portrait image for face-swap...');
    const portraitUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=256&h=256&q=80';
    const portraitResponse = await fetch(portraitUrl);
    const portraitBlob = await portraitResponse.blob();
    const portraitBuffer = Buffer.from(await portraitBlob.arrayBuffer());
    const portraitBase64 = `data:image/jpeg;base64,${portraitBuffer.toString('base64')}`;

    console.log('5. Capturing image (sending real female face base64)...');
    const captureRes = await fetch(BASE_URL + `/sessions/${sessionId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: portraitBase64 })
    }).then(r => r.json());
    console.log('Capture Response:', captureRes);

    if (!captureRes.success) {
      console.error('Capture request failed on server.');
      return;
    }

    console.log('6. Polling status...');
    for (let i = 0; i < 20; i++) {
      await sleep(3000);
      const statusRes = await fetch(BASE_URL + `/sessions/${sessionId}/status`).then(r => r.json());
      console.log(`Poll ${i+1}: status = ${statusRes.status}, generatedUrl = ${statusRes.generatedImageUrl ? 'Present' : 'None'}`);
      if (statusRes.status === 'completed' || statusRes.status === 'failed') {
        console.log('Final Status Data:', statusRes);
        break;
      }
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}
runTest();
