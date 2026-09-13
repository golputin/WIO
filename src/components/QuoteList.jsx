import { ArrowUpRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { changeTone, formatChange, formatCompact, formatPrice } from '../utils/formatters.js'
import { marketPath } from '../utils/routes.js'
import { SkeletonRow } from './LoadingState.jsx'
import AssetLogo from './AssetLogo.jsx'
import { ChangeText } from './ui.jsx'

/**
 * Live quote rows. `quotes` must be real Quote[] from the market provider.
 * Optional `onRemove(symbol)` renders a remove control (watchlist).
 */
export default function QuoteList({ quotes = [], onRemove, showVolume = true, className = '' }) {
  return (
    <ul className={`divide-y divide-border ${className}`}>
      {quotes.map((q) => (
        <QuoteRow key={q.symbol} q={q} onRemove={onRemove} showVolume={showVolume} />
      ))}
    </ul>
  )
}

export function QuoteRow({ q, onRemove, showVolume = true }) {
  const tone = changeTone(q.changePercent)
  const changeCls = tone === 'positive' ? 'text-green' : tone === 'negative' ? 'text-red' : 'text-muted'
  const price = formatPrice(q.price, q.currency)
  return (
    <li className="group row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 sm:gap-4">
      <AssetLogo symbol={q.symbol} name={q.name} size="sm" className="transition-transform duration-300 group-hover:scale-105" />
      <div className="min-w-0 flex-1">
        <Link to={marketPath(q.symbol)} className="font-semibold text-fg hover:text-gold">
          {q.symbol}
        </Link>
        <p className="truncate text-xs text-muted">{q.name}</p>
      </div>
      {showVolume && q.volume !== undefined && (
        <div className="tabular hidden w-24 text-right text-xs text-muted md:block">
          <p className="text-[10px] font-semibold tracking-wider uppercase">Vol</p>
          <p>{formatCompact(q.volume)}</p>
        </div>
      )}
      <div className="tabular text-right">
        <p className="text-sm font-semibold text-fg">{price ?? <span className="text-muted">—</span>}</p>
        <p className="text-xs">
          <span className={`hidden sm:inline ${changeCls}`}>{formatChange(q.change, q.currency)} </span>
          <ChangeText value={q.changePercent} />
        </p>
      </div>
      <Link
        to={marketPath(q.symbol)}
        aria-label={`Open analysis for ${q.symbol}`}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-gold"
      >
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(q.symbol)}
          aria-label={`Remove ${q.symbol} from watchlist`}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-red-100 hover:text-red"
        >
          <X className="size-4" />
        </button>
      )}
    </li>
  )
}

export function QuoteListSkeleton({ rows = 4 }) {
  return (
    <div className="divide-y divide-border" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={3} />
      ))}
    </div>
  )
}
