// Erzeugt die PWA-Icons (PNG) ohne externe Abhängigkeiten.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(out, { recursive: true })

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x / size, y / size)
      const o = y * (size * 4 + 1) + 1 + x * 4
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1
const inTri = (px, py, [ax, ay], [bx, by], [cx, cy]) => {
  const s = (ax - cx) * (py - cy) - (ay - cy) * (px - cx)
  const t = (bx - ax) * (py - ay) - (by - ay) * (px - ax)
  const u = (cx - bx) * (py - by) - (cy - by) * (px - bx)
  return (s >= 0 && t >= 0 && u >= 0) || (s <= 0 && t <= 0 && u <= 0)
}

function draw(x, y, rounded) {
  // abgerundete Ecken (transparent) für normale Icons
  if (rounded) {
    const r = 0.18
    const cx = x < r ? r : x > 1 - r ? 1 - r : x
    const cy = y < r ? r : y > 1 - r ? 1 - r : y
    if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) return [0, 0, 0, 0]
  }
  // Hintergrund: Nachtwald-Verlauf
  const t = y
  let r = Math.round(16 + t * 6), g = Math.round(33 - t * 10), b = Math.round(27 - t * 9)
  // Mond
  if ((x - 0.76) ** 2 + (y - 0.22) ** 2 <= 0.085 ** 2) return [232, 228, 216, 255]
  // Fisch: Körper + Schwanz + Rückenflosse
  const fish =
    inEllipse(x, y, 0.52, 0.58, 0.27, 0.13) ||
    inTri(x, y, [0.25, 0.58], [0.10, 0.46], [0.13, 0.58]) ||
    inTri(x, y, [0.25, 0.58], [0.10, 0.70], [0.13, 0.58]) ||
    inTri(x, y, [0.50, 0.46], [0.58, 0.34], [0.63, 0.47])
  if (fish) {
    // Auge
    if ((x - 0.69) ** 2 + (y - 0.55) ** 2 <= 0.022 ** 2) return [11, 21, 18, 255]
    return [255, 122, 41, 255]
  }
  // Wasserlinie
  if (y > 0.78 && y < 0.80 && Math.sin(x * 28) > 0.2) return [63, 174, 114, 200]
  return [r, g, b, 255]
}

for (const [name, size, rounded] of [
  ['icon-192.png', 192, true],
  ['icon-512.png', 512, true],
  ['icon-180.png', 180, false],
  ['maskable-512.png', 512, false],
]) {
  writeFileSync(join(out, name), png(size, (x, y) => draw(x, y, rounded)))
  console.log('✓', name)
}
