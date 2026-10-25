import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const svgSourcePath = path.join(publicDir, 'favicon.svg');

async function buildIco(buffers) {
  // buffers: [{ size: 16, buf: Buffer }, { size: 32, buf: Buffer }, { size: 48, buf: Buffer }]
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type: 1 = ICO
  header.writeUInt16LE(buffers.length, 4); // count

  let offset = 6 + buffers.length * 16;
  const dirEntries = [];
  for (const item of buffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // width
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buf.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // image offset
    offset += item.buf.length;
    dirEntries.push(entry);
  }

  return Buffer.concat([header, ...dirEntries, ...buffers.map(b => b.buf)]);
}

async function run() {
  console.log('🚀 LogoAnywhere: Genereren van digitale brand assets voor Quantum Initium...');
  const svgBuffer = fs.readFileSync(svgSourcePath);

  // 1. High-res master raster PNG (2048x2048)
  const master2048 = await sharp(svgBuffer)
    .resize(2048, 2048, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 2. Multi-size Favicon (favicon.ico: 16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  for (const s of icoSizes) {
    const buf = await sharp(master2048)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    icoBuffers.push({ size: s, buf });
  }
  const icoData = await buildIco(icoBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
  console.log('  ✓ favicon.ico gegenereerd (16x16, 32x32, 48x48)');

  // 3. Apple Touch Icon (180x180 - Geen transparantie, logo in 140x140 safe zone)
  const logo140 = await sharp(master2048).resize(140, 140, { fit: 'contain' }).png().toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 10, g: 10, b: 14, alpha: 1 } // Apple Midnight dark
    }
  })
    .composite([{ input: logo140, top: 20, left: 20 }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png gegenereerd (180x180, dekkend)');

  // 4. Android / PWA Icons (192x192 en 512x512)
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.8);
    const offset = Math.round((size - innerSize) / 2);
    const innerLogo = await sharp(master2048).resize(innerSize, innerSize, { fit: 'contain' }).png().toBuffer();
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerLogo, top: offset, left: offset }])
      .png()
      .toFile(path.join(publicDir, `android-chrome-${size}x{size}.png`.replace('{size}', size)));
    console.log(`  ✓ android-chrome-${size}x${size}.png gegenereerd`);
  }

  // 5. Social Avatar (1000x1000, 20% safe margin)
  const avatarLogo = await sharp(master2048).resize(700, 700, { fit: 'contain' }).png().toBuffer();
  await sharp({
    create: {
      width: 1000,
      height: 1000,
      channels: 4,
      background: { r: 10, g: 10, b: 14, alpha: 1 }
    }
  })
    .composite([{ input: avatarLogo, top: 150, left: 150 }])
    .png()
    .toFile(path.join(publicDir, 'social-avatar.png'));
  console.log('  ✓ social-avatar.png gegenereerd (1000x1000)');

  // 6. Open Graph Image (1200x630 - Premium Apple Glass Dark Canvas)
  const ogLogo = await sharp(master2048).resize(340, 340, { fit: 'contain' }).png().toBuffer();
  
  // Composite high-end card banner
  const ogSvgOverlay = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ogGlow" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#0071e3" stop-opacity="0.35"/>
        <stop offset="60%" stop-color="#5e5ce6" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#f5f5f7"/>
        <stop offset="100%" stop-color="#86868b"/>
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="1200" height="630" fill="#000000"/>
    <rect width="1200" height="630" fill="url(#ogGlow)"/>

    <!-- Subtle border frame -->
    <rect x="30" y="30" width="1140" height="570" rx="36" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

    <!-- Top Badge -->
    <rect x="440" y="70" width="320" height="38" rx="19" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="600" y="95" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-size="14" font-weight="600" fill="#2997ff" text-anchor="middle" letter-spacing="1.5">EXECUTIVE DIRECTIEHUB</text>

    <!-- Typography -->
    <text x="600" y="475" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-size="44" font-weight="700" fill="url(#textGrad)" text-anchor="middle" letter-spacing="-1">Quantum Initium Network</text>
    <text x="600" y="520" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="20" font-weight="400" fill="#86868b" text-anchor="middle">Centrale Directie- &amp; Partnercommunicatie • 12 Aangesloten Holdings</text>
    <text x="600" y="560" font-family="monospace" font-size="15" font-weight="600" fill="#30d158" text-anchor="middle">mail.quantuminitium.com</text>
  </svg>
  `;

  await sharp(Buffer.from(ogSvgOverlay))
    .composite([
      { input: ogLogo, top: 120, left: 430 } // Logo centered in top half
    ])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('  ✓ og-image.png gegenereerd (1200x630, Apple Dark Glass)');

  // 7. site.webmanifest
  const manifest = {
    name: 'Quantum Initium Network',
    short_name: 'Quantum Initium',
    description: 'Centrale zakelijke directie- en partnercommunicatiehub met geïntegreerde e-mail en realtime chat voor de 12 Quantum Initium holdings.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('  ✓ site.webmanifest aangemaakt');

  console.log('\n🎉 LogoAnywhere asset pack compleet!');
}

run().catch(err => {
  console.error('❌ Fout bij genereren van assets:', err);
  process.exit(1);
});
