const fs = require('fs');
const path = require('path');

const urls = [
  { name: 'latest_female_astronaut.jpg', url: 'https://res.cloudinary.com/db2dzqdsx/image/upload/v1782194923/ai-photobooth/loeiaybnfagat0srol87.jpg' },
  { name: 'prev_female_chef.jpg', url: 'https://res.cloudinary.com/db2dzqdsx/image/upload/v1782134401/ai-photobooth/vzuiw9g1odqpmkavh1wr.jpg' },
  { name: 'prev_female_avengers.jpg', url: 'https://res.cloudinary.com/db2dzqdsx/image/upload/v1782132680/ai-photobooth/osihu1iybi8bd5fhrhqc.jpg' }
];

async function download(url, filename) {
  const dest = path.join(__dirname, filename);
  console.log(`Downloading ${url} to ${dest}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`✓ Downloaded ${filename}`);
  } catch (err) {
    console.error(`✗ Error downloading ${filename}:`, err.message);
  }
}

async function run() {
  for (const item of urls) {
    await download(item.url, item.name);
  }
}

run();
