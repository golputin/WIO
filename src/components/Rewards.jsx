import { AlertTriangle, Gift, RefreshCw, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { providers } from '../config/environment.js'
import { useRewardBalances } from '../hooks/useRewards.js'
import { useWallet } from '../hooks/useWallet.jsx'
import { formatNumber, formatRelative, isZeroRaw } from '../utils/formatters.js'
import ClaimAllModal, { totalClaimableUsd } from './ClaimAllModal.jsx'
import ClaimModal from './ClaimModal.jsx'
import EmptyState from './EmptyState.jsx'
import RewardCard, { RewardCardSkeleton } from './RewardCard.jsx'
import WalletConnect from './WalletConnect.jsx'

/**
 * YOUR STOCK REWARDS — claimable balances for the connected wallet.
 *
 * Renders balances only after both the asset registry and the wallet's balances resolved from the
 * rewards backend. Every other situation is an explicit, honest state.
 */
export default function Rewards() {
  const wallet = useWallet()
  const { assets, balances, rows, refresh } = useRewardBalances()
  const [claimRow, setClaimRow] = useState(null)
  const [claimAllOpen, setClaimAllOpen] = useState(false)

  const claimableRows = useMemo(
    () => (rows ?? []).filter((r) => r.asset.enabled && r.claimable !== null && !isZeroRaw(r.claimable)),
    [rows],
  )
  const totalUsd = totalClaimableUsd(claimableRows)
  const busy = Boolean(claimRow) || claimAllOpen

  const onClaimed = () => refresh()

  return (
    <section aria-labelledby="your-rewards" className="card overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="eyebrow">Your stock rewards</p>
          <h2 id="your-rewards" className="mt-1 text-xl font-bold tracking-tight text-fg sm:text-2xl">
            Claimable balances
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {balances.state === 'ok' && balances.updatedAt && (
            <span className="hidden text-xs text-muted sm:inline">Updated {formatRelative(new Date(balances.updatedAt).toISOString())}</span>
          )}
          {wallet.isConnected && providers.rewards && (
            <button type="button" onClick={refresh} className="btn-ghost !px-3 !py-2 text-xs" aria-label="Refresh balances">
              <RefreshCw className={`size-3.5 ${balances.state === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </header>

      <div className="p-5 sm:p-6">
        {!providers.rewards ? (
          <EmptyState
            title="Reward data unavailable."
            description="Connect the rewards backend (VITE_REWARDS_API_URL) to read claimable balances from the reward contract."
          />
        ) : !wallet.isConnected ? (
          <EmptyState
            icon={Wallet}
            title="Connect your wallet to view your rewards."
            description={
              wallet.status === 'no_provider'
                ? 'No browser wallet detected. Install a wallet extension, then reload this page.'
                : 'Balances are read directly from the reward contract for your address.'
            }
            action={<WalletConnect />}
          />
        ) : assets.state === 'loading' || balances.state === 'loading' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading reward balances">
            {[0, 1, 2].map((i) => (
              <RewardCardSkeleton key={i} />
            ))}
          </div>
        ) : assets.state === 'unavailable' || balances.state === 'unavailable' ? (
          <EmptyState
            icon={(assets.error ?? balances.error)?.reason === 'network' ? 'network' : 'error'}
            title="Unable to retrieve reward balance."
            description={(assets.error ?? balances.error)?.message ?? 'Please reconnect your wallet and try again.'}
            onRetry={refresh}
          />
        ) : !rows || rows.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No reward assets configured."
            description="The reward contract has not published any enabled reward assets yet."
          />
        ) : (
          <>
            {wallet.wrongNetwork && (
              <div role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-red/40 bg-red-100 p-4 text-sm text-red sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  Your wallet is on a different network than the reward contract. Claims are disabled.
                </span>
                <button type="button" onClick={wallet.switchToExpected} className="btn-secondary !px-3.5 !py-2 text-xs">
                  Switch network
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((row, i) => (
                <RewardCard key={row.asset.symbol} row={row} index={i} busy={busy || wallet.wrongNetwork} onClaim={setClaimRow} />
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-bg p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Total claimable</p>
                {claimableRows.length === 0 ? (
                  <p className="mt-1 text-base font-semibold text-fg">Nothing to claim right now.</p>
                ) : totalUsd !== null ? (
                  <p className="tabular mt-1 text-2xl font-bold tracking-tight text-fg">
                    ≈ {formatNumber(totalUsd, { style: 'currency', currency: 'USD' })}
                  </p>
                ) : (
                  <p className="mt-1 text-base font-semibold text-fg">
                    {claimableRows.length} {claimableRows.length === 1 ? 'asset' : 'assets'} ready to claim
                    <span className="ml-2 text-xs font-normal text-muted">Fiat estimate not provided by backend.</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setClaimAllOpen(true)}
                disabled={claimableRows.length === 0 || busy || wallet.wrongNetwork}
                className="btn-primary w-full sm:w-auto"
              >
                <Gift className="size-4" /> Claim All
              </button>
            </div>
          </>
        )}
      </div>

      <ClaimModal open={Boolean(claimRow)} row={claimRow} onClose={() => setClaimRow(null)} onSuccess={onClaimed} />
      <ClaimAllModal open={claimAllOpen} rows={claimableRows} onClose={() => setClaimAllOpen(false)} onSuccess={onClaimed} />
    </section>
  )
}
