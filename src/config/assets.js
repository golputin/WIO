/**
 * Central asset metadata + logo resolution.
 *
 * Visual identity only — never prices, balances or any market figure. Company/ETF names for the
 * bundled assets are public brand names used for identification; every other display name comes
 * from the API responses.
 *
 * Resolution order for `getAssetLogoSources(symbol)`:
 *   1. bundled brand mark in /public/logos (reliable, same-origin)
 *   2. public ticker-logo CDN (covers arbitrary symbols returned by the market API)
 *   3. `<AssetLogo>` falls back to a designed monogram tile when every image fails
 */

const LOGO_CDN = 'https://financialmodelingprep.com/image-stock'

/** Symbols with a bundled logo. `bg` overrides the tile colour when the mark ships on a fixed background. */
const BUNDLED = Object.freeze({
  AAPL: { name: 'Apple', kind: 'equity' },
  AMZN: { name: 'Amazon', kind: 'equity' },
  NVDA: { name: 'NVIDIA', kind: 'equity' },
  TSLA: { name: 'Tesla', kind: 'equity' },
  SPY: { name: 'SPDR S&P 500 ETF Trust', kind: 'etf' },
  SPCX: { name: 'SpaceX', kind: 'equity', bg: '#000000' },
  BTC: { name: 'Bitcoin', kind: 'crypto', bg: '#0B0F17' },
  ETH: { name: 'Ethereum', kind: 'crypto', bg: '#FFFFFF' },
})

/** Index symbols returned by the market API carry no brand mark; they render as monogram tiles. */
const INDEX_SYMBOLS = new Set(['SPX', 'NASDAQ', 'DOW', 'RUT', 'VIX', '^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX'])

const CRYPTO_SUFFIX = /-?USDT?$/i

/** Normalise API symbols ("BTC-USD", "btc", "BRK.B") into a registry key. */
export function normalizeSymbol(symbol) {
  if (typeof symbol !== 'string') return ''
  const s = symbol.trim().toUpperCase()
  if (BUNDLED[s]) return s
  const stripped = s.replace(CRYPTO_SUFFIX, '')
  if (BUNDLED[stripped]) return stripped
  return s
}

export function isIndexSymbol(symbol) {
  return INDEX_SYMBOLS.has(String(symbol ?? '').toUpperCase())
}

/** Static metadata for a symbol, or null when we know nothing beyond the ticker itself. */
export function getAssetMeta(symbol) {
  const key = normalizeSymbol(symbol)
  const meta = BUNDLED[key]
  return meta ? { symbol: key, ...meta } : null
}

/** Ordered candidate image URLs. Empty for indices (no brand mark exists). */
export function getAssetLogoSources(symbol) {
  const key = normalizeSymbol(symbol)
  if (!key || isIndexSymbol(key)) return []
  const sources = []
  if (BUNDLED[key]) sources.push(`/logos/${key}.png`)
  const cdnKey = key.replace(/[^A-Z0-9.-]/g, '')
  if (cdnKey) sources.push(`${LOGO_CDN}/${encodeURIComponent(cdnKey)}.png`)
  return sources
}

/** Tile background for a symbol's mark. Light neutral by default so dark and colour marks both read. */
export function getAssetTileBackground(symbol) {
  return getAssetMeta(symbol)?.bg ?? '#F4F6FA'
}

/** Deterministic hue for the monogram fallback so the same ticker always gets the same tint. */
export function monogramHue(symbol) {
  const s = String(symbol ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}
