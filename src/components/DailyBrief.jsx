import { CalendarDays, ExternalLink, Newspaper } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useDailyBrief } from '../hooks/useMarketData.js'
import { formatDate, formatPrice, todayLabel } from '../utils/formatters.js'
import AssetLogo from './AssetLogo.jsx'
import EmptyState from './EmptyState.jsx'
import { SkeletonText } from './LoadingState.jsx'
import { ChangeText, SourceList } from './ui.jsx'

/**
 * MarketLens Daily. Content is generated server-side from real market + news data
 * (`newsApi.getDailyBrief`). Expected shape:
 * { date, overview, topMovers: Quote[], whatMatters: [{title, source, url}], earningsToday: [...], upcomingEvents: [...], sources }
 */
export default function DailyBrief() {
  const res = useDailyBrief()
  const b = res.state === 'ok' ? res.data : null
  const configured = providers.news

  return (
    <article className="card overflow-hidden shadow-float">
      <header className="flex flex-col gap-2 border-b border-border bg-navy px-6 py-6 text-white sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-300 uppercase">MarketLens Daily</p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight">{b?.date ? formatDate(b.date, { weekday: 'long', month: 'long' }) : todayLabel()}</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
          <Newspaper className="size-3.5" /> Generated from live market and news data
        </span>
      </header>

      {!configured ? (
        <EmptyState title="Today's market brief is unavailable." description="Connect the market and news data providers." />
      ) : res.state === 'unavailable' ? (
        <EmptyState
          icon={res.error?.reason === 'network' ? 'network' : 'error'}
          title="Today's market brief is unavailable."
          description={res.error?.message}
          onRetry={res.error?.retryable ? res.refresh : undefined}
        />
      ) : (
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          <Block title="Market overview" className="lg:col-span-3">
            {res.state === 'loading' ? <SkeletonText lines={3} /> : b?.overview ? <p className="text-sm leading-relaxed text-fg-2">{b.overview}</p> : <Muted>No overview available.</Muted>}
          </Block>

          <Block title="Top movers">
            {res.state === 'loading' ? (
              <SkeletonText lines={4} />
            ) : b?.topMovers?.length ? (
              <ul className="space-y-2.5">
                {b.topMovers.map((m) => (
                  <li key={m.symbol} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-fg">
                      <AssetLogo symbol={m.symbol} name={m.name} size="xs" /> {m.symbol}
                    </span>
                    <span className="tabular flex items-center gap-3">
                      <span className="text-fg-2">{formatPrice(m.price, m.currency)}</span>
                      <ChangeText value={m.changePercent} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Muted>No mover data.</Muted>
            )}
          </Block>

          <Block title="What matters">
            {res.state === 'loading' ? (
              <SkeletonText lines={4} />
            ) : b?.whatMatters?.length ? (
              <ul className="space-y-3">
                {b.whatMatters.map((w, i) => (
                  <li key={i} className="text-sm">
                    {w.url ? (
                      <a href={w.url} target="_blank" rel="noreferrer noopener" className="group inline-flex items-start gap-1.5 text-fg hover:text-gold">
                        <span>{w.title}</span>
                        <ExternalLink className="mt-1 size-3 shrink-0 text-muted group-hover:text-gold" />
                      </a>
                    ) : (
                      <span className="text-fg">{w.title}</span>
                    )}
                    {w.source && <p className="text-xs text-muted">{w.source}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <Muted>No notable events.</Muted>
            )}
          </Block>

          <Block title="Today's earnings">
            {res.state === 'loading' ? (
              <SkeletonText lines={4} />
            ) : b?.earningsToday?.length ? (
              <ul className="space-y-2.5">
                {b.earningsToday.map((e) => (
                  <li key={`${e.symbol}-${e.time ?? ''}`} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-semibold text-fg">{e.symbol}</span>
                      {e.name && <span className="ml-2 text-muted">{e.name}</span>}
                    </span>
                    {e.time && <span className="text-xs text-muted">{e.time}</span>}
                  </li>
                ))}
              </ul>
            ) : b?.earningsToday === null ? (
              <Muted>Earnings calendar not connected.</Muted>
            ) : (
              <Muted>No earnings scheduled today.</Muted>
            )}
          </Block>

          <Block title="Upcoming events" className="lg:col-span-3">
            {res.state === 'loading' ? (
              <SkeletonText lines={3} />
            ) : b?.upcomingEvents?.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {b.upcomingEvents.map((ev, i) => (
                  <li key={ev.id ?? i} className="flex gap-3 rounded-xl border border-border bg-bg p-3.5">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold" />
                    <div>
                      <p className="text-sm font-medium text-fg">{ev.title}</p>
                      <p className="text-xs text-muted">
                        {formatDate(ev.date)}
                        {ev.category && ` · ${ev.category}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Muted>No upcoming events.</Muted>
            )}
            {b?.sources?.length > 0 && <SourceList sources={b.sources} />}
          </Block>
        </div>
      )}
    </article>
  )
}

function Block({ title, children, className = '' }) {
  return (
    <section className={`bg-surface p-6 ${className}`}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-fg uppercase">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Muted({ children }) {
  return <p className="text-sm text-muted">{children}</p>
}
