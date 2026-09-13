import { BarChart3, CalendarDays, FileText, Flame, Radar, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { providers } from '../config/environment.js'
import { useEarnings, useMarketEvents, useMovers, useRecentFilings } from '../hooks/useMarketData.js'
import { formatDate, formatDateTime } from '../utils/formatters.js'
import { marketPath } from '../utils/routes.js'
import EmptyState from './EmptyState.jsx'
import { SkeletonText } from './LoadingState.jsx'
import QuoteList, { QuoteListSkeleton } from './QuoteList.jsx'
import { Badge, Reveal } from './ui.jsx'

/** Generic discovery card: header + one of loading / unavailable / empty / children. */
function DiscoveryCard({ icon: Icon, title, subtitle, res, configured, notConfiguredText, emptyText, skeleton, children, className = '' }) {
  const isEmpty = res.state === 'ok' && (!Array.isArray(res.data) || res.data.length === 0)
  return (
    <section aria-label={title} className={`card flex flex-col overflow-hidden ${className}`}>
      <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-2 text-gold">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-fg">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </header>
      <div className="flex-1 px-5">
        {!configured ? (
          <EmptyState compact title="Provider not configured." description={notConfiguredText} />
        ) : res.state === 'loading' ? (
          skeleton
        ) : res.state === 'unavailable' ? (
          <EmptyState
            compact
            icon={res.error?.reason === 'network' ? 'network' : 'error'}
            title="Unable to load."
            description={res.error?.message}
            onRetry={res.error?.retryable ? res.refresh : undefined}
          />
        ) : isEmpty ? (
          <EmptyState compact icon={Icon} title={emptyText} />
        ) : (
          children
        )}
      </div>
    </section>
  )
}

function MoversCard({ type, icon, title, subtitle, emptyText }) {
  const res = useMovers(type)
  return (
    <DiscoveryCard
      icon={icon}
      title={title}
      subtitle={subtitle}
      res={res}
      configured={providers.market}
      notConfiguredText="Connect VITE_MARKET_API_URL to load live market movers."
      emptyText={emptyText}
      skeleton={<QuoteListSkeleton rows={5} />}
    >
      <QuoteList quotes={(res.data ?? []).slice(0, 6)} showVolume={type === 'volume'} />
    </DiscoveryCard>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-4 py-4" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <SkeletonText key={i} lines={2} />
      ))}
    </div>
  )
}

function EarningsCard() {
  const res = useEarnings('upcoming')
  return (
    <DiscoveryCard
      icon={CalendarDays}
      title="Upcoming Earnings"
      subtitle="Confirmed report dates"
      res={res}
      configured={providers.market}
      notConfiguredText="Connect the market provider to load the earnings calendar."
      emptyText="No upcoming earnings found."
      skeleton={<ListSkeleton />}
    >
      <ul className="divide-y divide-border">
        {(res.data ?? []).slice(0, 8).map((e) => (
          <li key={`${e.symbol}-${e.date}`} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <Link to={marketPath(e.symbol)} className="font-semibold text-fg hover:text-gold">
                {e.symbol}
              </Link>
              <p className="truncate text-xs text-muted">{e.name}</p>
            </div>
            <div className="text-right text-xs">
              <p className="tabular font-semibold text-fg">{formatDate(e.date)}</p>
              {e.time && <p className="text-muted">{e.time}</p>}
            </div>
          </li>
        ))}
      </ul>
    </DiscoveryCard>
  )
}

function FilingsCard() {
  const res = useRecentFilings({ limit: 8 })
  return (
    <DiscoveryCard
      icon={FileText}
      title="Recent Filings"
      subtitle="Latest SEC & company documents"
      res={res}
      configured={providers.filings}
      notConfiguredText="Connect VITE_FILINGS_API_URL to load recent filings."
      emptyText="No recent filings."
      skeleton={<ListSkeleton />}
    >
      <ul className="divide-y divide-border">
        {(res.data ?? []).slice(0, 8).map((f) => (
          <li key={f.id ?? `${f.symbol}-${f.filedAt}`} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link to={marketPath(f.symbol)} className="font-semibold text-fg hover:text-gold">
                  {f.symbol}
                </Link>
                {f.formType && <Badge tone="blue">{f.formType}</Badge>}
              </div>
              <p className="truncate text-xs text-muted">{f.company ?? f.title}</p>
            </div>
            <p className="tabular shrink-0 text-xs text-muted">{formatDate(f.filedAt)}</p>
          </li>
        ))}
      </ul>
    </DiscoveryCard>
  )
}

function EventsCard() {
  const res = useMarketEvents()
  return (
    <DiscoveryCard
      icon={Radar}
      title="Market Events"
      subtitle="Scheduled macro & market-wide events"
      res={res}
      configured={providers.market}
      notConfiguredText="Connect the market provider to load the events calendar."
      emptyText="No scheduled events."
      skeleton={<ListSkeleton />}
    >
      <ul className="divide-y divide-border">
        {(res.data ?? []).slice(0, 8).map((ev) => (
          <li key={ev.id ?? `${ev.title}-${ev.date}`} className="py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-fg">{ev.title}</p>
              <p className="tabular shrink-0 text-xs text-muted">{formatDateTime(ev.date)}</p>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
              {ev.category && <Badge tone="muted">{ev.category}</Badge>}
              {ev.description && <span className="truncate">{ev.description}</span>}
            </div>
          </li>
        ))}
      </ul>
    </DiscoveryCard>
  )
}

/** Discovery grid — six live-data sections, each with its own honest empty/loading/error state. */
export default function MarketDiscovery() {
  const cards = [
    <MoversCard key="trending" type="trending" icon={Flame} title="Trending" subtitle="Most-watched assets right now" emptyText="Nothing trending yet." />,
    <MoversCard key="gainers" type="gainers" icon={TrendingUp} title="Top Movers" subtitle="Largest moves this session" emptyText="No movers reported." />,
    <MoversCard key="volume" type="volume" icon={BarChart3} title="High Volume" subtitle="Unusual trading activity" emptyText="No high-volume assets." />,
    <EarningsCard key="earnings" />,
    <FilingsCard key="filings" />,
    <EventsCard key="events" />,
  ]
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((c, i) => (
        <Reveal key={c.key} delay={i * 0.05} className="h-full">
          {c}
        </Reveal>
      ))}
    </div>
  )
}
