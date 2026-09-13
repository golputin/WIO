import { ExternalLink, FileText, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import AssetLogo from '../components/AssetLogo.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FilingIntelligence from '../components/FilingIntelligence.jsx'
import { SkeletonText } from '../components/LoadingState.jsx'
import SymbolPicker from '../components/SymbolPicker.jsx'
import { Badge, Reveal } from '../components/ui.jsx'
import { providers } from '../config/environment.js'
import { useRecentFilings } from '../hooks/useMarketData.js'
import { useSymbolParam } from '../hooks/useSymbolParam.js'
import { formatDate, formatRelative } from '../utils/formatters.js'
import { marketPath } from '../utils/routes.js'
import PageShell from './PageShell.jsx'

/**
 * /filings — SEC & company filings. `?symbol=` selects the company; without one the page follows
 * the most recent filing in the live feed (never a hardcoded ticker).
 */
export default function FilingsPage() {
  const [picked, setSymbol] = useSymbolParam()
  const feed = useRecentFilings({ symbol: picked ?? '', limit: 25 })
  const symbol = picked ?? (feed.state === 'ok' ? feed.data?.[0]?.symbol ?? null : null)

  return (
    <PageShell
      eyebrow="SEC & filing intelligence"
      title={symbol ? `${symbol} filings, distilled.` : 'Complex filings, distilled into what changed.'}
      subtitle="MarketLens reads the primary document and surfaces the metrics, developments and risks that moved — with the source attached."
      aside={
        <div className="flex items-center gap-2">
          <SymbolPicker value={picked} onChange={setSymbol} label="Change company" />
          {picked && (
            <>
              <button type="button" onClick={() => setSymbol(null)} className="btn-secondary !px-3.5 !py-2 text-xs" aria-label="Clear company filter">
                <X className="size-3.5" /> Clear
              </button>
              <Link to={marketPath(picked)} className="btn-primary !px-3.5 !py-2 text-xs">
                Analyse {picked}
              </Link>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <Reveal>
          <FilingIntelligence symbol={symbol} />
        </Reveal>
        <Reveal delay={0.08}>
          <FilingFeed res={feed} symbol={picked} onSelect={setSymbol} />
        </Reveal>
      </div>
    </PageShell>
  )
}

/** Recent filings list — the whole market feed, or one company when `symbol` is set. */
function FilingFeed({ res, symbol, onSelect }) {
  const items = res.state === 'ok' && Array.isArray(res.data) ? res.data : []
  return (
    <section aria-labelledby="filing-feed-heading" className="card overflow-hidden">
      <header className="flex items-center gap-2 border-b border-border px-5 py-4">
        <FileText className="size-4 text-gold" />
        <h2 id="filing-feed-heading" className="text-sm font-bold tracking-tight text-fg">
          {symbol ? 'Filing history' : 'Recent filings'}
          {symbol && <span className="ml-1.5 font-semibold text-muted">· {symbol}</span>}
        </h2>
        {res.updatedAt && <span className="ml-auto text-[11px] text-muted">Updated {formatRelative(res.updatedAt)}</span>}
      </header>
      {!providers.filings ? (
        <EmptyState title="Filing data provider is not configured." description="Connect VITE_FILINGS_API_URL to load SEC and company filings." />
      ) : res.state === 'loading' ? (
        <div className="space-y-5 p-5" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonText key={i} lines={2} />
          ))}
        </div>
      ) : res.state === 'unavailable' ? (
        <EmptyState
          icon={res.error?.reason === 'network' ? 'network' : 'error'}
          title="Unable to load filings."
          description={res.error?.message}
          onRetry={res.error?.retryable ? res.refresh : undefined}
        />
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="No filings found." description={symbol ? `Nothing has been filed for ${symbol} recently.` : 'The live feed returned no recent documents.'} />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((f) => (
            <li key={f.id ?? `${f.symbol}-${f.filedAt}`} className="flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-bg">
              <AssetLogo symbol={f.symbol} name={f.company} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelect(f.symbol)}
                    className="font-semibold text-fg hover:text-gold"
                    aria-label={`Analyse ${f.symbol} filings`}
                  >
                    {f.symbol}
                  </button>
                  {f.formType && <Badge tone="blue">{f.formType}</Badge>}
                </div>
                <p className="truncate text-xs text-muted">{f.company ?? f.title}</p>
              </div>
              <p className="tabular shrink-0 text-xs text-muted">{formatDate(f.filedAt)}</p>
              {f.url && (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Open ${f.formType ?? 'filing'} for ${f.symbol}`}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-gold"
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
