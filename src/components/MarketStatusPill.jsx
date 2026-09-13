import { useMarketStatus } from '../hooks/useMarketData.js'

const SESSION_LABELS = {
  regular: 'Regular session',
  pre: 'Pre-market',
  premarket: 'Pre-market',
  'pre-market': 'Pre-market',
  post: 'After hours',
  after: 'After hours',
  afterhours: 'After hours',
  'after-hours': 'After hours',
  extended: 'Extended hours',
  closed: 'Closed',
}

function sessionLabel(session) {
  if (!session || typeof session !== 'string') return null
  return SESSION_LABELS[session.toLowerCase()] ?? session
}

/**
 * Live market status sourced from GET /market/status.
 * Renders nothing while loading or when the provider is unavailable — never a guessed state.
 */
export default function MarketStatusPill({ className = '' }) {
  const { state, data } = useMarketStatus()
  if (state !== 'ok' || !data || typeof data.open !== 'boolean') return null

  const open = data.open
  const label = open ? 'Market open' : 'Market closed'
  const session = sessionLabel(data.session)
  const detail = session && session.toLowerCase() !== label.toLowerCase().replace('market ', '') ? session : null

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-2.5 py-1 text-[11px] font-medium text-fg-2 ${className}`}
      title={data.asOf ? `As of ${new Date(data.asOf).toLocaleString()}` : undefined}
    >
      <span className="relative flex size-1.5">
        {open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-green opacity-60" />}
        <span className={`relative inline-flex size-1.5 rounded-full ${open ? 'bg-green' : 'bg-dim'}`} />
      </span>
      <span className="tracking-wide whitespace-nowrap uppercase">{label}</span>
      {detail && <span className="hidden text-muted xl:inline">· {detail}</span>}
    </div>
  )
}
