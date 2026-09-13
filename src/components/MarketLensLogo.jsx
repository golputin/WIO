/**
 * MarketLens brand mark.
 *
 * Concept: a lens ring with an aperture at the top-right through which a rising market line
 * breaks out — intelligence (lens) focused on growth (line). Designed to stay legible at 16px.
 */

const TONES = {
  light: { ring: '#0B1F3A', line: '#1677FF', dot: '#1677FF', text: '#0B1F3A', accent: '#1677FF' },
  dark: { ring: '#FFFFFF', line: '#7FB4FF', dot: '#7FB4FF', text: '#FFFFFF', accent: '#7FB4FF' },
  mono: { ring: 'currentColor', line: 'currentColor', dot: 'currentColor', text: 'currentColor', accent: 'currentColor' },
}

export function MarketLensIcon({ size = 32, variant = 'light', className = '', title = 'MarketLens' }) {
  const t = TONES[variant] ?? TONES.light
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
      {/* Lens ring with aperture at top-right (gap centred at -45°) */}
      <circle
        cx="16"
        cy="16"
        r="12.5"
        stroke={t.ring}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="64 14.54"
        transform="rotate(-14 16 16)"
      />
      {/* Rising market line exiting through the aperture */}
      <path
        d="M9.5 20.5 L13.6 16.6 L17 18.8 L26.2 7.2"
        stroke={t.line}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Focus point */}
      <circle cx="26.2" cy="7.2" r="2.4" fill={t.dot} />
    </svg>
  )
}

export function MarketLensLogo({ height = 28, variant = 'light', className = '', showWordmark = true }) {
  const t = TONES[variant] ?? TONES.light
  const iconSize = height
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="MarketLens">
      <MarketLensIcon size={iconSize} variant={variant} />
      {showWordmark && (
        <span
          className="font-bold tracking-tight select-none"
          style={{ color: t.text, fontSize: height * 0.72, lineHeight: 1 }}
        >
          Market<span style={{ color: t.accent }}>Lens</span>
        </span>
      )}
    </span>
  )
}

export default MarketLensLogo
