const fs = require('fs');
const path = require('path');
// Since it's a PNG, we can use a basic reader or just print information if we had a library, 
// but we can also use image-size if installed, or just read the first few bytes.
// Better, let's use the 'image-size' package if available, or just check its file size.
// Actually, let's write a simple script to read the PNG header for width and height.

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  // PNG header check
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a valid PNG file');
  }
  // Width is at offset 16, Height at 20 (4 bytes big-endian each)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

try {
  const imgPath = path.join(__dirname, '../../frontend/public/assets/images/hero-bg.png');
  const dims = getPngDimensions(imgPath);
  console.log(`Image dimensions of hero-bg.png: width=${dims.width}, height=${dims.height}, ratio=${dims.width/dims.height}`);
} catch (err) {
  console.error("Error reading dimensions:", err.message);
}
