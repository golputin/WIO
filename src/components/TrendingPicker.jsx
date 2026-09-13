import { Flame } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useMovers } from '../hooks/useMarketData.js'
import AssetLogo from './AssetLogo.jsx'
import EmptyState from './EmptyState.jsx'
import { SkeletonRow } from './LoadingState.jsx'
import { ChangeText } from './ui.jsx'

/**
 * Live trending assets rendered as selectable rows. `onSelect(symbol)` switches the page's
 * active asset; the row matching `value` is highlighted. Symbols come only from the market provider.
 */
export default function TrendingPicker({ value, onSelect, title = 'Trending now', subtitle, limit = 8, className = '' }) {
  const res = useMovers('trending')
  const items = res.state === 'ok' && Array.isArray(res.data) ? res.data.slice(0, limit) : []

  return (
    <section aria-label={title} className={`card flex flex-col overflow-hidden ${className}`}>
      <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-2 text-gold">
          <Flame className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-fg">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </header>
      {!providers.market ? (
        <EmptyState compact title="Market provider is not configured." description="Connect VITE_MARKET_API_URL to load trending assets." />
      ) : res.state === 'loading' ? (
        <div className="divide-y divide-border px-5" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} cols={2} />
          ))}
        </div>
      ) : res.state === 'unavailable' ? (
        <EmptyState
          compact
          icon={res.error?.reason === 'network' ? 'network' : 'error'}
          title="Unable to load trending assets."
          description={res.error?.message}
          onRetry={res.error?.retryable ? res.refresh : undefined}
        />
      ) : items.length === 0 ? (
        <EmptyState compact icon={Flame} title="No trending assets right now." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((q) => {
            const active = value === q.symbol?.toUpperCase()
            return (
              <li key={q.symbol}>
                <button
                  type="button"
                  onClick={() => onSelect(q.symbol)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-bg ${active ? 'bg-gold-100' : ''}`}
                >
                  <AssetLogo symbol={q.symbol} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${active ? 'text-gold' : 'text-fg'}`}>{q.symbol}</p>
                    <p className="truncate text-xs text-muted">{q.name}</p>
                  </div>
                  <ChangeText value={q.changePercent} className="text-xs" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
