import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ExternalLink, FileText, Newspaper, Radar, ShieldCheck } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useMovementAnalysis, useQuote } from '../hooks/useMarketData.js'
import { changeTone, formatChange, formatPrice, formatRelative } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import { Skeleton, SkeletonText } from './LoadingState.jsx'
import SymbolPicker from './SymbolPicker.jsx'
import { Badge, ChangeText, SourceList } from './ui.jsx'

const FACTOR_ICON = { news: Newspaper, filing: FileText, event: Radar, signal: Activity }

/**
 * "Why Is It Moving?" — quote from the market provider, catalysts from the analytics service.
 * When the service cannot verify a cause it returns `catalystDetected: false` and we say so.
 */
export default function WhyMoving({ symbol, onChangeSymbol, embedded = false }) {
  const quote = useQuote(providers.market ? symbol : null)
  const analysis = useMovementAnalysis(providers.analytics ? symbol : null)
  const q = quote.state === 'ok' ? quote.data : null
  const a = analysis.state === 'ok' ? analysis.data : null
  const tone = changeTone(q?.changePercent)

  return (
    <div className={`card overflow-hidden ${embedded ? '' : 'shadow-float'}`}>
      {/* Header: asset identity */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          {!symbol ? (
            <p className="text-sm text-muted">Select an asset to analyse.</p>
          ) : quote.state === 'loading' ? (
            <>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="mt-2 h-4 w-48" />
            </>
          ) : q ? (
            <>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-bold tracking-tight text-fg">{q.symbol}</h3>
                {q.exchange && <Badge tone="muted">{q.exchange}</Badge>}
              </div>
              <p className="mt-0.5 truncate text-sm text-muted">{q.name}</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold tracking-tight text-fg">{symbol}</h3>
              <p className="mt-0.5 text-sm text-muted">
                {providers.market ? quote.error?.message ?? 'Quote unavailable.' : 'Market data provider is not configured.'}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          {q && (
            <div className="text-right">
              <p className="tabular text-2xl font-bold tracking-tight text-fg">{formatPrice(q.price, q.currency)}</p>
              <p className="tabular text-sm">
                <span className={tone === 'positive' ? 'text-green' : tone === 'negative' ? 'text-red' : 'text-muted'}>
                  {formatChange(q.change, q.currency)}
                </span>{' '}
                <ChangeText value={q.changePercent} />
              </p>
            </div>
          )}
          {onChangeSymbol && <SymbolPicker value={symbol} onChange={onChangeSymbol} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* Factors */}
        <div className="p-5 sm:p-6 lg:col-span-8 lg:border-r lg:border-border">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-gold" />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-fg uppercase">Why is it moving?</p>
            {a?.generatedAt && <span className="ml-auto text-[11px] text-muted">Analysed {formatRelative(a.generatedAt)}</span>}
          </div>
          <p className="mt-1 text-xs text-muted">Live detected factors, generated only from retrieved sources.</p>

          <div className="mt-5">
            {!symbol ? (
              <EmptyState compact icon="config" title="No asset selected." description="Search for a ticker to see verified catalysts." />
            ) : !providers.analytics ? (
              <EmptyState
                compact
                title="Analysis service is not configured."
                description="Connect the analytics service (VITE_ANALYTICS_API_URL) to detect verified catalysts."
              />
            ) : analysis.state === 'loading' ? (
              <ol className="space-y-4" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex gap-4">
                    <Skeleton className="h-5 w-7" />
                    <SkeletonText lines={2} className="flex-1" />
                  </li>
                ))}
              </ol>
            ) : analysis.state === 'unavailable' ? (
              <EmptyState
                compact
                icon={analysis.error?.reason === 'network' ? 'network' : 'error'}
                title="Unable to load analysis."
                description={analysis.error?.message}
                onRetry={analysis.error?.retryable ? analysis.refresh : undefined}
              />
            ) : a && a.catalystDetected && a.factors?.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <ol className="space-y-3">
                  {a.factors.map((f, i) => {
                    const Icon = FACTOR_ICON[f.type] ?? Activity
                    return (
                      <motion.li
                        key={`${f.title}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-4 rounded-xl border border-border bg-bg p-4"
                      >
                        <span className="tabular text-sm font-bold text-gold">{String(i + 1).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="size-3.5 shrink-0 text-muted" />
                            <p className="text-sm font-semibold text-fg">{f.title}</p>
                          </div>
                          {f.detail && <p className="mt-1 text-sm leading-relaxed text-muted">{f.detail}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            {f.sourceUrl ? (
                              <a href={f.sourceUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-gold hover:underline">
                                {f.sourceLabel ?? 'Source'} <ExternalLink className="size-3" />
                              </a>
                            ) : (
                              f.sourceLabel && <span>{f.sourceLabel}</span>
                            )}
                            {f.observedAt && <span>{formatRelative(f.observedAt)}</span>}
                          </div>
                        </div>
                      </motion.li>
                    )
                  })}
                </ol>
              </AnimatePresence>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-bg p-5 text-center">
                <ShieldCheck className="mx-auto size-5 text-gold" strokeWidth={1.75} />
                <p className="mt-2 text-sm font-semibold text-fg">No verified catalyst detected yet.</p>
                <p className="mt-1 text-sm text-muted">MarketLens is continuing to monitor available sources.</p>
              </div>
            )}
          </div>

          {a?.sources?.length > 0 && <SourceList sources={a.sources} />}
        </div>

        {/* Sentiment + confidence */}
        <div className="grid grid-cols-2 gap-4 border-t border-border p-5 sm:p-6 lg:col-span-4 lg:grid-cols-1 lg:border-t-0">
          <Stat
            label="Market sentiment"
            value={a?.sentiment?.label ?? null}
            sub={typeof a?.sentiment?.score === 'number' ? `Score ${a.sentiment.score}` : null}
            loading={analysis.state === 'loading'}
            configured={providers.analytics}
          />
          <Stat
            label="Confidence"
            value={typeof a?.confidence === 'number' ? `${Math.round(a.confidence)}%` : null}
            loading={analysis.state === 'loading'}
            configured={providers.analytics}
            bar={typeof a?.confidence === 'number' ? a.confidence : null}
          />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, loading, configured, bar }) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
      {loading ? (
        <Skeleton className="mt-3 h-6 w-20" />
      ) : value ? (
        <>
          <p className="mt-2 text-xl font-bold tracking-tight text-fg">{value}</p>
          {sub && <p className="text-xs text-muted">{sub}</p>}
          {typeof bar === 'number' && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, bar))}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">{configured ? 'Not available' : 'Not connected'}</p>
      )}
    </div>
  )
}
