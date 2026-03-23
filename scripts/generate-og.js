import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const WIDTH = 1200
const HEIGHT = 630

// AIA logo as SVG with green stroke
const aiaLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 48" width="80" height="66">
  <defs>
    <clipPath id="base"><rect x="0" y="0" width="58" height="46"/></clipPath>
  </defs>
  <g clip-path="url(#base)">
    <polyline points="2,48 20,5 38,48" fill="none" stroke="#00ff88" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter"/>
    <polyline points="20,48 38,5 56,48" fill="none" stroke="#00ff88" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter"/>
  </g>
  <circle cx="29" cy="5" r="2.2" fill="#00ff88"/>
</svg>
`

// Create the text/UI overlay as SVG
const overlaySvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&amp;display=swap');
    </style>
  </defs>

  <!-- Dark background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0a0a"/>

  <!-- Subtle border -->
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#1a1a1a" stroke-width="2"/>

  <!-- Photo area placeholder (will be composited) -->
  <rect x="60" y="80" width="440" height="490" fill="#111" stroke="#333" stroke-width="1.5" rx="3"/>

  <!-- AIA Logo -->
  <g transform="translate(580, 140)">
    <svg viewBox="0 0 58 48" width="90" height="74">
      <defs>
        <clipPath id="base2"><rect x="0" y="0" width="58" height="46"/></clipPath>
      </defs>
      <g clip-path="url(#base2)">
        <polyline points="2,48 20,5 38,48" fill="none" stroke="#00ff88" stroke-width="1.8"/>
        <polyline points="20,48 38,5 56,48" fill="none" stroke="#00ff88" stroke-width="1.8"/>
      </g>
      <circle cx="29" cy="5" r="2.2" fill="#00ff88"/>
    </svg>
  </g>

  <!-- Name -->
  <text x="580" y="290" fill="#ffffff" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="48" font-weight="700" letter-spacing="2">James S.</text>
  <text x="580" y="350" fill="#ffffff" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="48" font-weight="700" letter-spacing="2">Campbell</text>

  <!-- aka AIA -->
  <text x="580" y="400" fill="#888888" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="20" font-weight="300" letter-spacing="1">aka AIA</text>

  <!-- Dates -->
  <text x="580" y="450" fill="#666666" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="18" font-weight="300" letter-spacing="1">June 17, 1977 - July 1, 2025</text>

  <!-- Bottom bar -->
  <rect x="0" y="${HEIGHT - 50}" width="${WIDTH}" height="50" fill="#111111"/>
  <text x="60" y="${HEIGHT - 20}" fill="#00ff88" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="13" font-weight="400" letter-spacing="4" text-transform="uppercase">LISTENABLE MUSIC</text>
  <text x="1000" y="${HEIGHT - 20}" fill="#444444" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="12" font-weight="300">listenablemusic.ca</text>

  <!-- Accent line at top -->
  <rect x="0" y="0" width="${WIDTH}" height="2" fill="#00ff88" opacity="0.6"/>
</svg>
`

async function generate() {
  // Load and resize the photo
  const photo = await sharp(resolve(root, 'public/img/IMG_0236.JPG'))
    .resize(440, 490, { fit: 'cover', position: 'top' })
    .toBuffer()

  // Create the base from the SVG overlay
  const base = await sharp(Buffer.from(overlaySvg))
    .resize(WIDTH, HEIGHT)
    .png()
    .toBuffer()

  // Composite the photo onto the base
  const result = await sharp(base)
    .composite([
      {
        input: photo,
        left: 60,
        top: 80,
      }
    ])
    .png({ quality: 90 })
    .toFile(resolve(root, 'public/og-card.png'))

  console.log('Generated public/og-card.png:', result.width, 'x', result.height)
}

generate().catch(console.error)
