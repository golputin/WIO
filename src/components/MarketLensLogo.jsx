/**
 * MarketLens Capital brand mark.
 *
 * Concept: a geometric "M" built from two market pillars. The left pillar and the descending
 * stroke form the classic letter; the right stroke breaks out above the cap height and resolves
 * into a single champagne focal point — the lens. The right pillar is set back in tone so the
 * breakout line reads first. Legible at 16px; balanced in a rounded square for app icons.
 *
 * Geometry lives in `MARK_PATHS` so the static SVGs in /public/brand stay in sync.
 */

export const MARK_PATHS = Object.freeze({
  leftPillar: 'M7 25.5V8.5',
  descend: 'M7 8.5L16 19.5',
  breakout: 'M16 19.5L25.6 7.4',
  rightPillar: 'M25 25.5V14.5',
  lens: { cx: 25.6, cy: 7.4, r: 2.3 },
})

const TONES = {
  dark: { primary: '#F4F6FA', secondary: 'rgba(244,246,250,0.42)', accent: '#C9A961', word: '#F4F6FA', sub: '#C9A961' },
  light: { primary: '#0B0F17', secondary: 'rgba(11,15,23,0.4)', accent: '#9B7E3E', word: '#0B0F17', sub: '#9B7E3E' },
  mono: { primary: 'currentColor', secondary: 'currentColor', accent: 'currentColor', word: 'currentColor', sub: 'currentColor' },
}

export function MarketLensMark({ size = 32, variant = 'dark', framed = false, className = '', title = 'MarketLens Capital' }) {
  const t = TONES[variant] ?? TONES.dark
  const stroke = 2.6
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      {framed && (
        <>
          <rect width="32" height="32" rx="7.5" fill="#0B0F17" />
          <rect x="0.5" y="0.5" width="31" height="31" rx="7" stroke="rgba(255,255,255,0.08)" />
        </>
      )}
      <path d={MARK_PATHS.leftPillar} stroke={t.primary} strokeWidth={stroke} strokeLinecap="round" />
      <path d={MARK_PATHS.descend} stroke={t.primary} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d={MARK_PATHS.rightPillar} stroke={t.secondary} strokeWidth={stroke} strokeLinecap="round" />
      <path d={MARK_PATHS.breakout} stroke={t.accent} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={MARK_PATHS.lens.cx} cy={MARK_PATHS.lens.cy} r={MARK_PATHS.lens.r} fill={t.accent} />
    </svg>
  )
}

/**
 * Lockup: mark + two-line wordmark. `height` is the mark size; type scales with it.
 * `compact` renders a single-line "MARKETLENS" for tight spaces.
 */
export function MarketLensLogo({ height = 28, variant = 'dark', className = '', showWordmark = true, compact = false }) {
  const t = TONES[variant] ?? TONES.dark
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="MarketLens Capital">
      <MarketLensMark size={height} variant={variant} />
      {showWordmark && (
        <span className="flex flex-col justify-center leading-none select-none">
          <span
            className="font-bold tracking-[0.16em]"
            style={{ color: t.word, fontSize: compact ? height * 0.46 : height * 0.44, lineHeight: 1 }}
          >
            MARKETLENS
          </span>
          {!compact && (
            <span
              className="mt-[0.28em] font-semibold tracking-[0.34em]"
              style={{ color: t.sub, fontSize: height * 0.3, lineHeight: 1 }}
            >
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
