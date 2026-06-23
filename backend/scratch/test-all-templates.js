const BASE_URL = 'https://ai-photobooth-bfen.onrender.com/api';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const testTemplates = [
  // Male Templates
  { id: 'formal_suit', gender: 'male', faceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=256&h=256&q=80' },
  { id: 'kurta_pajama', gender: 'male', faceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=256&h=256&q=80' },
  { id: 'sherwani', gender: 'male', faceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=256&h=256&q=80' },
  
  // Female Templates
  { id: 'saree', gender: 'female', faceUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=256&h=256&q=80' },
  { id: 'salwar_suit', gender: 'female', faceUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=256&h=256&q=80' },
  { id: 'formal_women', gender: 'female', faceUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=256&h=256&q=80' }
];

async function runTemplatesQA() {
  console.log('🚀 Starting Automated AI PhotoBooth Templates QA on live server...');
  console.log('URL:', BASE_URL);
  console.log('------------------------------------------------------------');

  const results = [];

  for (const tpl of testTemplates) {
    console.log(`\n👉 Testing Template: "${tpl.id}" (${tpl.gender})...`);
    try {
      // 1. Create session
      const sessionRes = await fetch(BASE_URL + '/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: `QA_${tpl.id}` })
      }).then(r => r.json());
      const sessionId = sessionRes.sessionId;
      if (!sessionId) throw new Error('Failed to create session');

      // 2. Select Gender
      await fetch(BASE_URL + `/sessions/${sessionId}/gender`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender: tpl.gender })
      });

      // 3. Select Template
      await fetch(BASE_URL + `/sessions/${sessionId}/template`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: tpl.id })
      });

      // 4. Fetch face image & convert to base64
      const faceRes = await fetch(tpl.faceUrl);
      const faceBlob = await faceRes.blob();
      const faceBuffer = Buffer.from(await faceBlob.arrayBuffer());
      const faceBase64 = `data:image/jpeg;base64,${faceBuffer.toString('base64')}`;

      // 5. Trigger capture
      const captureRes = await fetch(BASE_URL + `/sessions/${sessionId}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: faceBase64 })
      }).then(r => r.json());

      if (!captureRes.success) {
        throw new Error(`Capture API failed: ${captureRes.error || 'unknown'}`);
      }

      // 6. Poll status
      let success = false;
      let finalData = null;
      // Max 10 polls (30 seconds) per template
      for (let poll = 1; poll <= 10; poll++) {
        await sleep(3000);
        const statusRes = await fetch(BASE_URL + `/sessions/${sessionId}/status`).then(r => r.json());
        if (statusRes.status === 'completed' && statusRes.generatedImageUrl) {
          // Check if it's the raw image or swapped (they should be different unless it fell back)
          const isSwapped = statusRes.generatedImageUrl !== statusRes.rawUserImageUrl;
          success = true;
          finalData = {
            status: 'success',
            isSwapped,
            rawUrl: statusRes.rawUserImageUrl,
            generatedUrl: statusRes.generatedImageUrl
          };
          console.log(`   ✓ Completed in poll ${poll}! Face-Swapped: ${isSwapped ? 'YES' : 'NO (Fallback)'}`);
          break;
        } else if (statusRes.status === 'failed') {
          finalData = { status: 'failed', error: 'AI generation task marked as failed on server' };
          console.log('   ✗ Failed on server.');
          break;
        }
      }

      if (!success && !finalData) {
        finalData = { status: 'timeout', error: 'Polling timed out' };
        console.log('   ✗ Polling timed out.');
      }

      results.push({ id: tpl.id, gender: tpl.gender, ...finalData });

    } catch (err) {
      console.error(`   ✗ Error during template test: ${err.message}`);
      results.push({ id: tpl.id, gender: tpl.gender, status: 'error', error: err.message });
    }
  }

  console.log('\n============================================================');
  console.log('📊 QA AUTOMATION RESULTS SUMMARY:');
  console.log('============================================================');
  console.table(results.map(r => ({
    Template: r.id,
    Gender: r.gender,
    Status: r.status,
    'Face Swapped?': r.isSwapped !== undefined ? (r.isSwapped ? '✅ YES' : '⚠️ Fallback') : '❌ N/A',
    Detail: r.error || 'OK'
  })));
  console.log('============================================================');
}

runTemplatesQA();
