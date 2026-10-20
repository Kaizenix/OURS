const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  // Each row starts with filter byte 0, then 4 bytes per pixel (RGBA)
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Draw rounded card shape
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Warm burgundy circle / monogram badge
      if (dist < width * 0.44) {
        rawData[pxOffset] = 168;     // R
        rawData[pxOffset + 1] = 68;  // G
        rawData[pxOffset + 2] = 84;  // B (Warm Rose/Burgundy)
        rawData[pxOffset + 3] = 255; // Alpha
      } else {
        rawData[pxOffset] = r;       // Background R (26)
        rawData[pxOffset + 1] = g;   // Background G (22)
        rawData[pxOffset + 2] = b;   // Background B (20)
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr[16] = 8; // bit depth
  ihdr[17] = 6; // color type: RGBA
  ihdr[18] = 0; // compression
  ihdr[19] = 0; // filter
  ihdr[20] = 0; // interlace
  const ihdrCrc = crc32(ihdr.subarray(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);

  // IDAT
  const idat = Buffer.alloc(4 + 4 + deflated.length + 4);
  idat.writeUInt32BE(deflated.length, 0);
  idat.write('IDAT', 4);
  deflated.copy(idat, 8);
  const idatCrc = crc32(idat.subarray(4, 8 + deflated.length));
  idat.writeUInt32BE(idatCrc, 8 + deflated.length);

  // IEND
  const iend = Buffer.alloc(12);
  iend.writeUInt32BE(0, 0);
  iend.write('IEND', 4);
  const iendCrc = crc32(iend.subarray(4, 8));
  iend.writeUInt32BE(iendCrc, 8);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Standard CRC32
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, 26, 22, 20));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, 26, 22, 20));
console.log('Created PWA icons successfully in', iconsDir);
