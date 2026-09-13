import { motion, useReducedMotion } from 'framer-motion'
import { Activity, CalendarDays, Radio } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useChart, useEarnings, useMovementAnalysis, useMovers, useQuote } from '../hooks/useMarketData.js'
import { changeTone, formatChange, formatCompact, formatDate, formatPrice, formatRelative } from '../utils/formatters.js'
import AssetLogo from './AssetLogo.jsx'
import { Skeleton } from './LoadingState.jsx'
import StockChart from './StockChart.jsx'
import { Badge, ChangeText } from './ui.jsx'

/**
 * Hero product visual. Every value comes from the market/analytics providers.
 * Featured symbol = first live trending asset (or `symbol` prop). Nothing is hardcoded.
 */
export default function MarketDashboard({ symbol: symbolProp, floating = true }) {
  const reduce = useReducedMotion()
  const trending = useMovers('trending')
  const symbol = symbolProp ?? (trending.state === 'ok' && trending.data?.[0]?.symbol) ?? null

  const quote = useQuote(symbol)
  const chart = useChart(symbol, '1D')
  const analysis = useMovementAnalysis(providers.analytics ? symbol : null)
  const earnings = useEarnings('upcoming')

  const q = quote.state === 'ok' ? quote.data : null
  const tone = changeTone(q?.changePercent)
  const nextEarnings =
    earnings.state === 'ok' && symbol ? (earnings.data ?? []).find((e) => e.symbol?.toUpperCase() === symbol) : null

  const waiting = !providers.market
  const resolvingSymbol = providers.market && !symbolProp && trending.state === 'loading'
  const noSymbol = providers.market && !symbol && trending.state !== 'loading'

  return (
    <motion.div
      className="relative"
      animate={floating && !reduce ? { y: [0, -8, 0] } : undefined}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="card overflow-hidden shadow-float">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span
                className={`absolute inline-flex size-full rounded-full ${q ? 'bg-green' : 'bg-muted/50'} ${
                  q && !reduce ? 'animate-ping opacity-60' : 'opacity-0'
                }`}
              />
              <span className={`relative inline-flex size-2 rounded-full ${q ? 'bg-green' : 'bg-muted/50'}`} />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Live market data</span>
          </div>
          {q?.asOf && <span className="text-[11px] text-muted">Updated {formatRelative(q.asOf)}</span>}
        </div>

        {waiting || noSymbol ? (
          <WaitingState reason={waiting ? 'not_configured' : 'no_symbol'} />
        ) : (
          <div className="p-5">
            {/* Identity + price */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {resolvingSymbol || quote.state === 'loading' ? (
                  <>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="mt-2 h-3.5 w-40" />
                  </>
                ) : q ? (
                  <div className="flex items-center gap-3">
                    <AssetLogo symbol={q.symbol} name={q.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-fg">{q.symbol}</span>
                        {q.exchange && <Badge tone="muted">{q.exchange}</Badge>}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted">{q.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Quote unavailable</p>
                )}
              </div>
              <div className="text-right">
                {quote.state === 'loading' || resolvingSymbol ? (
                  <>
                    <Skeleton className="ml-auto h-7 w-28" />
                    <Skeleton className="mt-2 ml-auto h-3.5 w-20" />
                  </>
                ) : q ? (
                  <>
                    <p className="tabular text-2xl font-bold tracking-tight text-fg">{formatPrice(q.price, q.currency)}</p>
                    <p className="tabular mt-0.5 text-sm">
                      <span className={tone === 'positive' ? 'text-green' : tone === 'negative' ? 'text-red' : 'text-muted'}>
                        {formatChange(q.change, q.currency)}
                      </span>{' '}
                      <ChangeText value={q.changePercent} />
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            {/* Chart */}
            <div className="mt-5">
              <StockChart candles={chart.data} state={chart.state} height={150} tone={tone} currency={q?.currency} />
            </div>

            {/* Metrics */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="Volume" value={formatCompact(q?.volume)} loading={quote.state === 'loading'} />
              <Metric label="Market cap" value={formatCompact(q?.marketCap)} loading={quote.state === 'loading'} />
              <Metric
                label="Sentiment"
                value={analysis.state === 'ok' ? analysis.data?.sentiment?.label ?? null : null}
                loading={analysis.state === 'loading'}
                unavailableText={providers.analytics ? undefined : 'Not connected'}
              />
            </div>

            {/* Why is it moving */}
            <div className="mt-5 rounded-xl border border-border bg-bg p-4">
              <div className="flex items-center gap-2">
                <Activity className="size-3.5 text-gold" />
                <p className="text-[11px] font-semibold tracking-[0.14em] text-fg uppercase">Why is it moving?</p>
              </div>
              <div className="mt-2.5 text-sm">
                {!providers.analytics ? (
                  <p className="text-muted">Connect the analytics service to see verified catalysts.</p>
                ) : analysis.state === 'loading' ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                ) : analysis.state === 'ok' && analysis.data?.catalystDetected && analysis.data.factors?.[0] ? (
                  <p className="text-fg">{analysis.data.factors[0].title}</p>
                ) : analysis.state === 'ok' ? (
                  <p className="text-muted">No verified catalyst detected yet. MarketLens is continuing to monitor available sources.</p>
                ) : (
                  <p className="text-muted">Analysis unavailable.</p>
                )}
              </div>
            </div>

            {/* Earnings */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <CalendarDays className="size-3.5" /> Next earnings
              </span>
              {earnings.state === 'loading' ? (
                <Skeleton className="h-3.5 w-20" />
              ) : nextEarnings?.date ? (
                <span className="font-semibold text-fg">{formatDate(nextEarnings.date)}</span>
              ) : (
                <span className="text-muted">Not scheduled</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Metric({ label, value, loading, unavailableText = '—' }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-4 w-14" />
      ) : (
        <p className={`tabular mt-0.5 text-sm font-semibold ${value ? 'text-fg' : 'text-muted/70'}`}>{value ?? unavailableText}</p>
      )}
    </div>
  )
}

function WaitingState({ reason }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-2 text-gold">
        <Radio className="size-5" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-base font-semibold text-fg">Waiting for market data...</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        {reason === 'not_configured'
          ? 'Connect a market data provider to display live prices, charts and analysis here.'
          : 'The market data provider returned no featured assets.'}
      </p>
      {reason === 'not_configured' && (
        <code className="mt-4 rounded-lg border border-border bg-bg px-2.5 py-1 font-mono text-[11px] text-muted">
          VITE_MARKET_API_URL
        </code>
      )}
      <div className="mt-8 grid w-full grid-cols-3 gap-3 opacity-60" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-dashed border-border px-3 py-2.5">
            <div className="h-2.5 w-12 rounded bg-surface-2" />
            <div className="mt-2 h-3.5 w-16 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
