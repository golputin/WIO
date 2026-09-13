/**
 * Regenerates the static brand assets in /public from the single geometry source in
 * src/config/brand.js. Run: `node scripts/brand.mjs` (then rasterise PNGs, see README).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { LOGO_GEOMETRY as g, LOGO_TONES } from '../src/config/brand.js'

const sw = 3

function candle([x, wt, wb, bt, bb, up], t) {
  const c = up ? t.up : t.down
  return `<line x1="${x}" y1="${wt}" x2="${x}" y2="${wb}" stroke="${c}" stroke-width="${sw * 0.5}" stroke-linecap="round"/>` + `<rect x="${x - sw * 0.9}" y="${bt}" width="${sw * 1.8}" height="${bb - bt}" rx="${sw * 0.35}" fill="${c}"/>`
}

function mark({ variant = 'dark', framed = false, size = 64, id = 'ml' } = {}) {
  const t = LOGO_TONES[variant]
  const lens = (l) => `<circle cx="${l.cx}" cy="${l.cy}" r="${l.r}"`
  const glint = (l) => `<path d="M${l.cx - 7} ${l.cy - 6.5}a9 9 0 0 1 5.5-3" stroke="${t.glassEdge}" stroke-width="${sw * 0.5}" stroke-linecap="round"/>`
  return `<svg width="${size}" height="${size}" viewBox="${g.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MarketLens Capital">
  <defs>
    <clipPath id="${id}-l">${lens(g.left).replace(`r="${g.left.r}"`, `r="${g.left.r - sw / 2}"`)}/></clipPath>
    <clipPath id="${id}-r">${lens(g.right).replace(`r="${g.right.r}"`, `r="${g.right.r - sw / 2}"`)}/></clipPath>
  </defs>
  ${framed ? `<rect width="64" height="64" rx="15" fill="#0B0F17"/><rect x="0.5" y="0.5" width="63" height="63" rx="14.5" stroke="rgba(255,255,255,0.08)"/>` : ''}
  ${lens(g.left)} fill="${t.glass}"/>
  ${lens(g.right)} fill="${t.glass}"/>
  <g clip-path="url(#${id}-l)">${g.leftCandles.map((c) => candle(c, t)).join('')}</g>
  <g clip-path="url(#${id}-r)">${g.rightCandles.map((c) => candle(c, t)).join('')}</g>
  ${lens(g.left)} stroke="${t.frame}" stroke-width="${sw}"/>
  ${lens(g.right)} stroke="${t.frame}" stroke-width="${sw}"/>
  <path d="${g.bridge}" stroke="${t.frame}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="${g.templeL}" stroke="${t.frame}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="${g.templeR}" stroke="${t.frame}" stroke-width="${sw}" stroke-linecap="round"/>
  ${glint(g.left)}${glint(g.right)}
</svg>
`
}

function lockup({ variant = 'dark' } = {}) {
  const t = LOGO_TONES[variant]
  const m = mark({ variant, size: 64, id: `lk-${variant}` }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return `<svg width="300" height="64" viewBox="0 0 300 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MarketLens Capital">
  <g>${m}</g>
  <text x="78" y="33" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="24" letter-spacing="3.4" fill="${t.word}">MARKETLENS</text>
  <text x="78" y="52" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-weight="600" font-size="13" letter-spacing="4.4" fill="${t.sub}">CAPITAL</text>
</svg>
`
}

mkdirSync('public/brand', { recursive: true })
writeFileSync('public/favicon.svg', mark({ framed: true, size: 64, id: 'fav' }))
writeFileSync('public/brand/marketlens-icon.svg', mark({ framed: true, size: 512, id: 'icon' }))
writeFileSync('public/brand/marketlens-icon-dark.svg', mark({ framed: false, size: 512, id: 'icon-dark' }))
writeFileSync('public/brand/marketlens-icon-light.svg', mark({ variant: 'light', framed: false, size: 512, id: 'icon-light' }))
writeFileSync('public/brand/marketlens-logo.svg', lockup({ variant: 'dark' }))
writeFileSync('public/brand/marketlens-logo-light.svg', lockup({ variant: 'light' }))
console.log('brand SVGs written')
