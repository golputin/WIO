/**
 * MarketLens Capital brand mark — MARKET + LENS.
 *
 * A flat pair of round spectacles. Each lens holds a small candlestick series, so the mark reads
 * as "see the market through a different lens" at a glance. 2D, single stroke weight, champagne
 * frames on navy. Legible at 16px; balanced in a rounded square for app icons.
 *
 * Geometry lives in `LOGO_GEOMETRY` so the static SVGs in /public (favicon, brand, social) stay
 * in sync — see scripts/brand.mjs.
 */

import { LOGO_GEOMETRY, LOGO_TONES } from '../config/brand.js'

export { LOGO_GEOMETRY, LOGO_TONES }

function Candle({ c, t, sw }) {
  const [x, wt, wb, bt, bb, up] = c
  const color = up ? t.up : t.down
  return (
    <>
      <line x1={x} y1={wt} x2={x} y2={wb} stroke={color} strokeWidth={sw * 0.5} strokeLinecap="round" />
      <rect x={x - sw * 0.9} y={bt} width={sw * 1.8} height={bb - bt} rx={sw * 0.35} fill={color} />
    </>
  )
}

export function MarketLensMark({ size = 32, variant = 'dark', framed = false, className = '', title = 'MarketLens Capital', id = 'ml' }) {
  const t = LOGO_TONES[variant] ?? LOGO_TONES.dark
  const g = LOGO_GEOMETRY
  const sw = 3
  const clipL = `${id}-lens-l`
  const clipR = `${id}-lens-r`
  return (
    <svg width={size} height={size} viewBox={g.viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title} className={className}>
      <defs>
        <clipPath id={clipL}>
          <circle cx={g.left.cx} cy={g.left.cy} r={g.left.r - sw / 2} />
        </clipPath>
        <clipPath id={clipR}>
          <circle cx={g.right.cx} cy={g.right.cy} r={g.right.r - sw / 2} />
        </clipPath>
      </defs>
      {framed && (
        <>
          <rect width="64" height="64" rx="15" fill="#0B0F17" />
          <rect x="0.5" y="0.5" width="63" height="63" rx="14.5" stroke="rgba(255,255,255,0.08)" />
        </>
      )}
      {/* glass */}
      <circle cx={g.left.cx} cy={g.left.cy} r={g.left.r} fill={t.glass} />
      <circle cx={g.right.cx} cy={g.right.cy} r={g.right.r} fill={t.glass} />
      {/* candles inside lenses */}
      <g clipPath={`url(#${clipL})`}>
        {g.leftCandles.map((c) => (
          <Candle key={c[0]} c={c} t={t} sw={sw} />
        ))}
      </g>
      <g clipPath={`url(#${clipR})`}>
        {g.rightCandles.map((c) => (
          <Candle key={c[0]} c={c} t={t} sw={sw} />
        ))}
      </g>
      {/* frames */}
      <circle cx={g.left.cx} cy={g.left.cy} r={g.left.r} stroke={t.frame} strokeWidth={sw} />
      <circle cx={g.right.cx} cy={g.right.cy} r={g.right.r} stroke={t.frame} strokeWidth={sw} />
      <path d={g.bridge} stroke={t.frame} strokeWidth={sw} strokeLinecap="round" />
      <path d={g.templeL} stroke={t.frame} strokeWidth={sw} strokeLinecap="round" />
      <path d={g.templeR} stroke={t.frame} strokeWidth={sw} strokeLinecap="round" />
      {/* glint */}
      <path d={`M${g.left.cx - 7} ${g.left.cy - 6.5}a9 9 0 0 1 5.5-3`} stroke={t.glassEdge} strokeWidth={sw * 0.5} strokeLinecap="round" />
      <path d={`M${g.right.cx - 7} ${g.right.cy - 6.5}a9 9 0 0 1 5.5-3`} stroke={t.glassEdge} strokeWidth={sw * 0.5} strokeLinecap="round" />
    </svg>
  )
}

/**
 * Lockup: mark + wordmark. `height` is the mark size; type scales with it.
 * `compact` renders a single-line "MARKETLENS" for tight spaces.
 */
export function MarketLensLogo({ height = 28, variant = 'dark', className = '', showWordmark = true, compact = false }) {
  const t = LOGO_TONES[variant] ?? LOGO_TONES.dark
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="MarketLens Capital">
      <MarketLensMark size={height * 1.15} variant={variant} id={`ml-${height}`} />
      {showWordmark && (
        <span className="flex flex-col justify-center leading-none select-none">
          <span className="font-bold tracking-[0.14em]" style={{ color: t.word, fontSize: compact ? height * 0.46 : height * 0.44, lineHeight: 1 }}>
            MARKETLENS
          </span>
          {!compact && (
            <span className="mt-[0.28em] font-semibold tracking-[0.34em]" style={{ color: t.sub, fontSize: height * 0.3, lineHeight: 1 }}>
              CAPITAL
            </span>
          )}
        </span>
      )}
    </span>
  )
}

/** Backwards-compatible alias for older imports. */
export const MarketLensIcon = MarketLensMark

export default MarketLensLogo
