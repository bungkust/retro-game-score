import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SVG icon
function createSVGIcon(size, isMaskable = false) {
  const safeZone = isMaskable ? size * 0.8 : size;
  const offset = isMaskable ? (size - safeZone) / 2 : 0;
  const scale = size / 512;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0d1621"/>
  
  <!-- Border -->
  <rect x="${offset + 10 * scale}" y="${offset + 10 * scale}" 
        width="${safeZone - 20 * scale}" height="${safeZone - 20 * scale}" 
        fill="none" stroke="#00ffff" stroke-width="${8 * scale}"/>
  
  <!-- Leaderboard lines -->
  <line x1="${offset + 60 * scale}" y1="${offset + 100 * scale}" 
        x2="${offset + safeZone - 60 * scale}" y2="${offset + 100 * scale}" 
        stroke="#00ffff" stroke-width="${4 * scale}"/>
  <line x1="${offset + 60 * scale}" y1="${offset + 200 * scale}" 
        x2="${offset + safeZone - 60 * scale}" y2="${offset + 200 * scale}" 
        stroke="#00ffff" stroke-width="${4 * scale}"/>
  <line x1="${offset + 60 * scale}" y1="${offset + 300 * scale}" 
        x2="${offset + safeZone - 60 * scale}" y2="${offset + 300 * scale}" 
        stroke="#00ffff" stroke-width="${4 * scale}"/>
  
  <!-- Score indicators -->
  <rect x="${offset + 70 * scale}" y="${offset + 92 * scale}" 
        width="${12 * scale}" height="${12 * scale}" fill="#00ffff"/>
  <rect x="${offset + 70 * scale}" y="${offset + 192 * scale}" 
        width="${12 * scale}" height="${12 * scale}" fill="#00ffff"/>
  <rect x="${offset + 70 * scale}" y="${offset + 292 * scale}" 
        width="${12 * scale}" height="${12 * scale}" fill="#00ffff"/>
  
  <!-- Title "SCORE" simplified -->
  ${size >= 192 ? `
  <!-- Letter "S" pixel art -->
  <rect x="${offset + safeZone / 2 - 30 * scale}" y="${offset + 40 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 24 * scale}" y="${offset + 40 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 18 * scale}" y="${offset + 40 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 12 * scale}" y="${offset + 40 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 6 * scale}" y="${offset + 40 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 30 * scale}" y="${offset + 46 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 24 * scale}" y="${offset + 52 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 18 * scale}" y="${offset + 52 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 12 * scale}" y="${offset + 52 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 18 * scale}" y="${offset + 58 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 12 * scale}" y="${offset + 64 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 6 * scale}" y="${offset + 64 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2}" y="${offset + 64 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 30 * scale}" y="${offset + 64 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2 - 6 * scale}" y="${offset + 70 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  <rect x="${offset + safeZone / 2}" y="${offset + 70 * scale}" width="${6 * scale}" height="${6 * scale}" fill="#ffff00"/>
  ` : ''}
</svg>`;
}

// Generate icons
async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sizes = [64, 192, 512];

  // Generate regular icons
  for (const size of sizes) {
    const svg = createSVGIcon(size, false);
    const svgBuffer = Buffer.from(svg);
    const pngPath = path.join(publicDir, `pwa-${size}x${size}.png`);
    
    await sharp(svgBuffer)
      .png()
      .resize(size, size)
      .toFile(pngPath);
    
    console.log(`Generated: pwa-${size}x${size}.png`);
  }

  // Generate maskable icon
  const maskableSVG = createSVGIcon(512, true);
  const maskableBuffer = Buffer.from(maskableSVG);
  const maskablePath = path.join(publicDir, 'maskable-icon-512x512.png');
  
  await sharp(maskableBuffer)
    .png()
    .resize(512, 512)
    .toFile(maskablePath);
  
  console.log('Generated: maskable-icon-512x512.png');

  // Generate favicon.ico (32x32 for favicon)
  const faviconSVG = createSVGIcon(32, false);
  const faviconBuffer = Buffer.from(faviconSVG);
  const faviconPath = path.join(publicDir, 'favicon.ico');
  
  await sharp(faviconBuffer)
    .png()
    .resize(32, 32)
    .toFile(faviconPath);
  
  console.log('Generated: favicon.ico');
  console.log('\n✅ All PWA icons have been generated successfully!');
}

// Run the generator
generateIcons().catch(console.error);
