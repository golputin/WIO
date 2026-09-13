import { AlertTriangle, ExternalLink, FileText, Sparkles, TrendingUp } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useLatestFilingAnalysis } from '../hooks/useMarketData.js'
import { formatDate } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import { Skeleton, SkeletonText } from './LoadingState.jsx'
import SymbolPicker from './SymbolPicker.jsx'
import { Badge, SourceList } from './ui.jsx'

/**
 * SEC & filing intelligence for one company. The AI summary is produced server-side from the real
 * filing document; the UI never composes one.
 */
export default function FilingIntelligence({ symbol, onChangeSymbol }) {
  const res = useLatestFilingAnalysis(providers.filings ? symbol : null)
  const a = res.state === 'ok' ? res.data : null

  return (
    <div className="card overflow-hidden shadow-float">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Company</p>
          {res.state === 'loading' ? (
            <Skeleton className="mt-2 h-7 w-56" />
          ) : a?.filing ? (
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h3 className="text-2xl font-bold tracking-tight text-fg">{a.filing.company}</h3>
              <Badge tone="blue">{a.filing.formType}</Badge>
              {a.filing.filedAt && <span className="text-xs text-muted">Filed {formatDate(a.filing.filedAt)}</span>}
            </div>
          ) : (
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-fg">{symbol ?? 'No company selected'}</h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          {a?.filing?.url && (
            <a href={a.filing.url} target="_blank" rel="noreferrer noopener" className="btn-secondary !px-3.5 !py-2 text-xs">
              <FileText className="size-3.5" /> Source document <ExternalLink className="size-3" />
            </a>
          )}
          {onChangeSymbol && <SymbolPicker value={symbol} onChange={onChangeSymbol} label="Change company" />}
        </div>
      </div>

      {!symbol ? (
        <EmptyState title="Select a company." description="Search for a ticker to analyse its latest filing." />
      ) : !providers.filings ? (
        <EmptyState
          title="Filing data provider is not configured."
          description="Connect the filings service (VITE_FILINGS_API_URL) to analyse SEC and company filings."
        />
      ) : res.state === 'unavailable' ? (
        <EmptyState
          icon={res.error?.reason === 'network' ? 'network' : 'error'}
          title="Unable to load filing intelligence."
          description={res.error?.message}
          onRetry={res.error?.retryable ? res.refresh : undefined}
        />
      ) : (
        <div className="grid gap-px bg-border lg:grid-cols-12">
          {/* What changed */}
          <Panel className="lg:col-span-4" icon={TrendingUp} title="What changed?">
            {res.state === 'loading' ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-5 w-32" />
                  </div>
                ))}
              </div>
            ) : a?.metrics?.length ? (
              <dl className="space-y-4">
                {a.metrics.map((m) => (
                  <div key={m.label} className="flex items-start justify-between gap-4">
                    <dt className="text-sm text-muted">{m.label}</dt>
                    <dd className="text-right">
                      <p className="tabular text-sm font-semibold text-fg">{m.current}</p>
                      {(m.previous || m.delta) && (
                        <p className="tabular text-xs text-muted">
                          {m.previous && <span>from {m.previous}</span>}
                          {m.delta && <span className="ml-1.5 font-medium text-gold">{m.delta}</span>}
                        </p>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted">No comparable metrics were extracted from this filing.</p>
            )}
          </Panel>

          {/* Developments + risks */}
          <Panel className="lg:col-span-4" icon={Sparkles} title="Key developments">
            <BulletList items={a?.developments} loading={res.state === 'loading'} empty="No developments identified." />
            <div className="mt-6 flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-muted" />
              <p className="text-[11px] font-semibold tracking-[0.14em] text-fg uppercase">Key risks</p>
            </div>
            <div className="mt-3">
              <BulletList items={a?.risks} loading={res.state === 'loading'} empty="No new risk factors identified." />
            </div>
          </Panel>

          {/* AI summary */}
          <Panel className="lg:col-span-4" icon={Sparkles} title="AI summary" accent>
            {res.state === 'loading' ? (
              <SkeletonText lines={6} />
            ) : a?.summary ? (
              <p className="text-sm leading-relaxed text-fg-2">{a.summary}</p>
            ) : (
              <p className="text-sm text-muted">No summary is available for this filing.</p>
            )}
            {a && (
              <SourceList
                sources={
                  a.sources?.length
                    ? a.sources
                    : a.filing?.url
                      ? [{ label: `${a.filing.formType} filing`, url: a.filing.url }]
                      : []
                }
              />
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

function Panel({ icon: Icon, title, children, className = '', accent = false }) {
  return (
    <div className={`bg-surface p-5 sm:p-6 ${accent ? 'bg-gradient-to-b from-surface-2/60 to-surface' : ''} ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-gold" />
        <p className="text-[11px] font-semibold tracking-[0.14em] text-fg uppercase">{title}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function BulletList({ items, loading, empty }) {
  if (loading) return <SkeletonText lines={3} />
  if (!Array.isArray(items) || items.length === 0) return <p className="text-sm text-muted">{empty}</p>
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          {it}
        </li>
      ))}
    </ul>
  )
}
