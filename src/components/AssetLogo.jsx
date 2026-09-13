import { useState } from 'react'
import { getAssetLogoSources, getAssetTileBackground, isIndexSymbol, monogramHue } from '../config/assets.js'

const SIZES = {
  xs: { box: 'size-6 rounded-md', text: 'text-[9px]', pad: 'p-[3px]' },
  sm: { box: 'size-8 rounded-lg', text: 'text-[10px]', pad: 'p-1' },
  md: { box: 'size-10 rounded-lg', text: 'text-xs', pad: 'p-1.5' },
  lg: { box: 'size-12 rounded-xl', text: 'text-sm', pad: 'p-2' },
  xl: { box: 'size-16 rounded-2xl', text: 'text-base', pad: 'p-2.5' },
}

/**
 * Resolves the visual for any market or reward asset: bundled brand mark → public logo CDN →
 * designed monogram tile. Usage: `<AssetLogo symbol="AAPL" />`.
 *
 * Indices never carry a brand mark and go straight to the monogram tile. All images are lazy.
 */
export default function AssetLogo({ symbol, size = 'md', className = '', name }) {
  const s = SIZES[size] ?? SIZES.md
  const sources = getAssetLogoSources(symbol)
  // Failed attempts are tracked per symbol so a new symbol restarts the source chain without an effect.
  const [failed, setFailed] = useState({ symbol, attempt: 0 })
  const attempt = failed.symbol === symbol ? failed.attempt : 0
  const setAttempt = (next) => setFailed({ symbol, attempt: next })

  const src = sources[attempt] ?? null
  const label = name ? `${name} logo` : `${symbol} logo`

  if (!src) return <Monogram symbol={symbol} size={size} className={className} label={label} />

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-border ${s.box} ${s.pad} ${className}`}
      style={{ backgroundColor: getAssetTileBackground(symbol) }}
      aria-hidden="true"
    >
      <img
        key={src}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setAttempt(attempt + 1)}
        className="size-full object-contain"
      />
    </span>
  )
}

/** Deterministic tinted tile with up to three characters of the ticker. Used for indices and unknowns. */
export function Monogram({ symbol, size = 'md', className = '', label }) {
  const s = SIZES[size] ?? SIZES.md
  const text = String(symbol ?? '?').replace(/^\^/, '')
  const short = isIndexSymbol(text) ? text.slice(0, 4) : text.slice(0, 3)
  const hue = monogramHue(text)
  return (
    <span
      role="img"
      aria-label={label ?? `${symbol} monogram`}
      className={`inline-flex shrink-0 items-center justify-center border border-border font-mono font-semibold tracking-tight text-fg ${s.box} ${s.text} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 22% 18%) 0%, hsl(${hue} 18% 11%) 100%)`,
      }}
    >
      {short}
    </span>
  )
}
