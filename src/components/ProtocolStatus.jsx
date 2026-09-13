import { Clock, PauseCircle, RefreshCw } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useProtocolStatus } from '../hooks/useRewards.js'
import { formatDateTime, formatGwei, formatNumber, formatRelative, formatTokenAmount, formatWeiToNative } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import { Skeleton } from './LoadingState.jsx'
import { Badge } from './ui.jsx'

const ENGINE = {
  operational: { label: 'Operational', tone: 'green' },
  degraded: { label: 'Degraded', tone: 'red' },
  paused: { label: 'Paused', tone: 'muted' },
  deferred: { label: 'Deferred', tone: 'blue' },
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{label}</dt>
      <dd className="tabular text-right text-sm font-semibold text-navy">{children}</dd>
    </div>
  )
}

const Unavailable = () => <span className="font-normal text-muted">Unavailable</span>

/**
 * Transparent keeper / reward engine status, read from the rewards backend.
 * Nothing here is computed in the browser; the keeper runs off-chain on a VPS.
 */
export default function ProtocolStatus({ className = '' }) {
  const status = useProtocolStatus()
  const s = status.state === 'ok' ? status.data : null
  const engine = s ? ENGINE[s.engine] ?? { label: s.engine, tone: 'muted' } : null

  return (
    <section aria-labelledby="protocol-status" className={`card overflow-hidden ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="eyebrow">Protocol status</p>
          <h2 id="protocol-status" className="mt-1 text-base font-bold tracking-tight text-navy">
            Reward engine
          </h2>
        </div>
        {providers.rewards && (
          <button type="button" onClick={status.refresh} className="btn-ghost !px-2.5 !py-1.5 text-xs" aria-label="Refresh protocol status">
            <RefreshCw className={`size-3.5 ${status.state === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        )}
      </header>

      <div className="px-5">
        {!providers.rewards ? (
          <EmptyState compact title="Protocol status unavailable." description="Connect the rewards backend to read keeper status." />
        ) : status.state === 'loading' ? (
          <dl className="divide-y divide-border" aria-busy="true">
            {['Reward engine', 'Last distribution', 'Next check', 'Reward pool', 'Network'].map((l) => (
              <Row key={l} label={l}>
                <Skeleton className="h-4 w-24" />
              </Row>
            ))}
          </dl>
        ) : status.state === 'unavailable' ? (
          <EmptyState
            compact
            icon={status.error?.reason === 'network' ? 'network' : 'error'}
            title="Unable to load protocol status."
            description={status.error?.message}
            onRetry={status.error?.retryable ? status.refresh : undefined}
          />
        ) : (
          <>
            <dl className="divide-y divide-border">
              <Row label="Reward engine">
                <Badge tone={engine.tone} dot>
                  {engine.label}
                </Badge>
              </Row>
              <Row label="Last distribution">
                {s.lastDistributionAt ? (
                  <span title={formatDateTime(s.lastDistributionAt)}>{formatRelative(s.lastDistributionAt)}</span>
                ) : (
                  <span className="font-normal text-muted">No distribution yet</span>
                )}
              </Row>
              <Row label="Next check">
                {s.nextCheckAt ? (
                  <span className="inline-flex items-center gap-1.5" title={formatDateTime(s.nextCheckAt)}>
                    <Clock className="size-3.5 text-muted" /> {formatRelative(s.nextCheckAt)}
                  </span>
                ) : (
                  <Unavailable />
                )}
              </Row>
              <Row label="Reward pool">
                {s.rewardPool ? (
                  <>
                    {formatTokenAmount(s.rewardPool.amount, s.rewardPool.decimals)} {s.rewardPool.symbol}
                  </>
                ) : (
                  <Unavailable />
                )}
              </Row>
              <Row label="Network">
                {s.network ? (
                  <>
                    {s.network.name} <span className="font-normal text-muted">· {s.network.chainId}</span>
                  </>
                ) : (
                  <Unavailable />
                )}
              </Row>
            </dl>

            {s.lastGasEstimate && (
              <div className="mb-4 rounded-xl border border-border bg-bg p-3.5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Last keeper gas estimate</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                  <dt>Estimated gas</dt>
                  <dd className="tabular text-right text-navy">{formatNumber(Number(s.lastGasEstimate.gasLimit))}</dd>
                  <dt>Gas price</dt>
                  <dd className="tabular text-right text-navy">{formatGwei(s.lastGasEstimate.gasPriceWei)}</dd>
                  <dt>Estimated network cost</dt>
                  <dd className="tabular text-right text-navy">
                    {formatWeiToNative(s.lastGasEstimate.totalWei)} {s.lastGasEstimate.nativeSymbol ?? ''}
                  </dd>
                </dl>
              </div>
            )}

            {s.engine === 'deferred' && (
              <div role="status" className="mb-4 flex gap-3 rounded-xl border border-blue-100 bg-light p-3.5 text-sm text-navy">
                <PauseCircle className="mt-0.5 size-4 shrink-0 text-blue" />
                <div>
                  <p className="font-semibold">Reward processing deferred.</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {s.deferredReason ?? 'The protocol will retry when execution conditions are met.'}
                  </p>
                </div>
              </div>
            )}

            {s.asOf && <p className="pb-4 text-[11px] text-muted">Reported by keeper {formatRelative(s.asOf)}.</p>}
          </>
        )}
      </div>
    </section>
  )
}
