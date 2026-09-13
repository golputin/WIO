import { ExternalLink, History, Wallet } from 'lucide-react'
import { explorerLink, providers } from '../config/environment.js'
import { useRewardHistory } from '../hooks/useRewards.js'
import { useWallet } from '../hooks/useWallet.jsx'
import { formatDate, formatDateTime, formatTokenAmount, shortHash } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import LoadingState from './LoadingState.jsx'
import AssetLogo from './AssetLogo.jsx'
import { Badge } from './ui.jsx'
import WalletConnect from './WalletConnect.jsx'

const STATUS = {
  claimed: { label: 'Claimed', tone: 'green' },
  claimable: { label: 'Claimable', tone: 'blue' },
  pending: { label: 'Pending', tone: 'muted' },
}

function TxLink({ hash }) {
  if (!hash) return <span className="text-muted">—</span>
  const href = explorerLink('tx', hash)
  const label = <span className="font-mono text-xs">{shortHash(hash)}</span>
  if (!href) return label
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-gold underline-offset-2 hover:underline"
      aria-label={`Open transaction ${hash} in block explorer`}
    >
      {label} <ExternalLink className="size-3" />
    </a>
  )
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { label: status ?? 'Unknown', tone: 'muted' }
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  )
}

/**
 * REWARD HISTORY — distributions and claims indexed from the chain by the rewards backend.
 * Table on ≥sm, stacked cards on mobile.
 */
export default function RewardHistory({ className = '' }) {
  const wallet = useWallet()
  const history = useRewardHistory()
  const entries = history.state === 'ok' && Array.isArray(history.data) ? history.data : []

  return (
    <section aria-labelledby="reward-history" className={`card overflow-hidden ${className}`}>
      <header className="border-b border-border p-5 sm:p-6">
        <p className="eyebrow">Reward history</p>
        <h2 id="reward-history" className="mt-1 text-xl font-bold tracking-tight text-fg sm:text-2xl">
          Distributions & claims
        </h2>
      </header>

      {!providers.rewards ? (
        <EmptyState title="Reward history unavailable." description="Connect the rewards backend to load on-chain history." />
      ) : !wallet.isConnected ? (
        <EmptyState icon={Wallet} title="Connect your wallet to view your history." action={<WalletConnect size="sm" />} />
      ) : history.state === 'loading' ? (
        <LoadingState label="Loading reward history..." rows={4} className="p-5 sm:p-6" />
      ) : history.state === 'unavailable' ? (
        <EmptyState
          icon={history.error?.reason === 'network' ? 'network' : 'error'}
          title="Unable to load reward history."
          description={history.error?.message}
          onRetry={history.error?.retryable ? history.refresh : undefined}
        />
      ) : entries.length === 0 ? (
        <EmptyState icon={History} title="No reward history available." description="Distributions will appear here once recorded on-chain." />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Asset
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((e) => (
                  <tr key={e.id ?? `${e.txHash}-${e.symbol}-${e.distributedAt}`} className="transition-colors hover:bg-bg">
                    <td className="tabular px-6 py-3.5 whitespace-nowrap text-fg" title={formatDateTime(e.distributedAt) ?? undefined}>
                      {formatDate(e.distributedAt) ?? <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2.5 font-semibold text-fg">
                        <AssetLogo symbol={e.symbol} size="sm" /> {e.symbol}
                      </span>
                    </td>
                    <td className="tabular px-4 py-3.5 text-right font-semibold text-fg">
                      {formatTokenAmount(e.amount, e.decimals) ?? <span className="font-normal text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <TxLink hash={e.txHash} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border sm:hidden">
            {entries.map((e) => (
              <li key={e.id ?? `${e.txHash}-${e.symbol}-${e.distributedAt}`} className="flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2.5 font-semibold text-fg">
                    <AssetLogo symbol={e.symbol} size="sm" /> {e.symbol}
                  </span>
                  <StatusBadge status={e.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">{formatDateTime(e.distributedAt) ?? '—'}</span>
                  <span className="tabular font-semibold text-fg">{formatTokenAmount(e.amount, e.decimals) ?? '—'}</span>
                </div>
                <div className="text-xs">
                  <TxLink hash={e.txHash} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
