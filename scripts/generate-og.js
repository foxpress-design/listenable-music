import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const WIDTH = 1200
const HEIGHT = 630

// Generate sequencer squares SVG
function sequencerSquares() {
  const squares = []
  const startX = 580
  const startY = 500
  const size = 28
  const gap = 6
  const cols = 16
  const rows = 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (size + gap)
      const y = startY + row * (size + gap)
      // Seeded random using a hash-like formula
      const seed = Math.sin(col * 127.1 + row * 311.7) * 43758.5453
      const rand = seed - Math.floor(seed)
      const lit = rand > 0.55
      const fill = lit ? '#00ff88' : '#1a1a1a'
      const stroke = lit ? '#00ff88' : '#2a2a2a'
      const opacity = lit ? (0.4 + rand * 0.6) : 1
      squares.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`)
    }
  }
  return squares.join('\n  ')
}

// Create the text/UI overlay as SVG
const overlaySvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <!-- Dark background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0a0a"/>

  <!-- Subtle border -->
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#1a1a1a" stroke-width="2"/>

  <!-- Photo area placeholder (will be composited) -->
  <rect x="60" y="40" width="440" height="530" fill="#111" stroke="#333" stroke-width="1.5" rx="3"/>

  <!-- AIA Logo -->
  <g transform="translate(580, 120)">
    <svg viewBox="0 0 58 48" width="100" height="82">
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

  <!-- Name - single line -->
  <text x="580" y="290" fill="#ffffff" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="42" font-weight="700" letter-spacing="1">James S. Campbell</text>

  <!-- aka AIA -->
  <text x="580" y="345" fill="#e0e0e0" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="34" font-weight="400" letter-spacing="4">aka AIA</text>

  <!-- Subtitle -->
  <text x="580" y="405" fill="#cccccc" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="26" font-weight="300" letter-spacing="2">A Digital Tribute</text>

  <!-- Dates -->
  <text x="580" y="460" fill="#cccccc" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="24" font-weight="300" letter-spacing="1">June 17, 1977 - July 1, 2025</text>

  <!-- Sequencer squares -->
  ${sequencerSquares()}

  <!-- Bottom bar -->
  <rect x="0" y="${HEIGHT - 46}" width="${WIDTH}" height="46" fill="#111111"/>
  <text x="60" y="${HEIGHT - 18}" fill="#00ff88" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="22" font-weight="700" letter-spacing="8">LISTENABLE MUSIC</text>
  <text fill="#cccccc" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="20" font-weight="400" letter-spacing="2" x="1140" y="${HEIGHT - 19}" text-anchor="end">listenablemusic.ca</text>

  <!-- Accent line at top -->
  <rect x="0" y="0" width="${WIDTH}" height="2" fill="#00ff88" opacity="0.6"/>
</svg>
`

async function generate() {
  // Load and resize the photo
  const photo = await sharp(resolve(root, 'public/img/IMG_0236.JPG'))
    .resize(440, 530, { fit: 'cover', position: 'top' })
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
        top: 40,
      }
    ])
    .png({ quality: 90 })
    .toFile(resolve(root, 'public/og-card.png'))

  console.log('Generated public/og-card.png:', result.width, 'x', result.height)
}

generate().catch(console.error)
