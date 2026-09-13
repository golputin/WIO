import { Radio } from 'lucide-react'
import { useIndices } from '../hooks/useMarketData.js'
import { changeTone, formatNumber, formatPercent } from '../utils/formatters.js'
import AssetLogo from './AssetLogo.jsx'
import { LensLoader, Skeleton } from './LoadingState.jsx'

/**
 * Horizontal index ticker. Values come from `marketApi.getIndices`. On mobile the strip scrolls
 * horizontally; on wide screens with data it animates continuously (paused on hover).
 */
export default function MarketTicker() {
  const { state, data, error } = useIndices()
  const items = state === 'ok' && Array.isArray(data) ? data.filter((d) => typeof d?.value === 'number') : []

  return (
    <div className="border-y border-border bg-surface/70 backdrop-blur" role="region" aria-label="Market indices">
      <div className="container-x flex h-12 items-center gap-4">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          <Radio className="size-3.5 text-gold" /> Indices
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          {state === 'loading' && (
            <div className="flex items-center gap-8" aria-busy="true">
              <LensLoader label="Reading the market..." />
              {[0, 1, 2].map((i) => (
                <span key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-3.5 w-12" />
                </span>
              ))}
            </div>
          )}
          {state === 'unavailable' && (
            <p className="truncate text-sm text-muted">
              Live market data unavailable
              {error?.reason === 'not_configured' ? ' — connect a market data provider.' : error?.message ? ` — ${error.message}` : '.'}
            </p>
          )}
          {state === 'ok' && items.length === 0 && <p className="text-sm text-muted">Live market data unavailable.</p>}
          {state === 'ok' && items.length > 0 && (
            <div className="no-scrollbar flex overflow-x-auto sm:overflow-hidden">
              <ul className="flex shrink-0 items-center gap-8 pr-8 sm:animate-ticker">
                {items.map((it) => (
                  <TickerItem key={it.symbol} item={it} />
                ))}
                {/* duplicate for seamless loop on desktop only */}
                {items.map((it) => (
                  <TickerItem key={`${it.symbol}-dup`} item={it} ariaHidden className="hidden sm:flex" />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TickerItem({ item, ariaHidden = false, className = '' }) {
  const tone = changeTone(item.changePercent)
  const color = tone === 'positive' ? 'text-green' : tone === 'negative' ? 'text-red' : 'text-muted'
  return (
    <li className={`flex items-center gap-2.5 text-sm whitespace-nowrap ${className}`} aria-hidden={ariaHidden || undefined}>
      <AssetLogo symbol={item.symbol} name={item.name} size="xs" />
      <span className="font-semibold text-fg">{item.name ?? item.symbol}</span>
      <span className="tabular text-fg-2">{formatNumber(item.value)}</span>
      <span className={`tabular font-semibold ${color}`}>{formatPercent(item.changePercent)}</span>
    </li>
  )
}
