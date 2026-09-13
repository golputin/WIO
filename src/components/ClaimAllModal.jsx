import { useWallet } from '../hooks/useWallet.jsx'
import { formatNumber } from '../utils/formatters.js'
import { ClaimFeeBlock, ClaimFooter, ClaimProgress, ClaimRow, useClaimDialog } from './ClaimModal.jsx'
import Modal from './Modal.jsx'

/** Sum backend-provided fiat estimates; null unless every row carries one. */
export function totalClaimableUsd(rows) {
  if (!rows?.length) return null
  let total = 0
  for (const r of rows) {
    if (r.claimableUsd === null || r.claimableUsd === undefined) return null
    const n = Number(r.claimableUsd)
    if (!Number.isFinite(n)) return null
    total += n
  }
  return total
}

/**
 * Claim every asset with a non-zero live balance in a single transaction.
 * `rows` must already be filtered to claimable assets (see Rewards.jsx).
 */
export default function ClaimAllModal({ open, onClose, rows = [], onSuccess }) {
  const wallet = useWallet()
  const symbols = rows.map((r) => r.asset.symbol)
  const claim = useClaimDialog({ open, symbols, onSuccess })
  const totalUsd = totalClaimableUsd(rows)

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={claim.locked}
      size="lg"
      title="Claim All Rewards"
      description={`${rows.length} ${rows.length === 1 ? 'asset' : 'assets'} in one transaction, signed by your wallet.`}
      footer={
        <ClaimFooter
          step={claim.step}
          onConfirm={claim.confirm}
          onClose={onClose}
          onRetry={claim.retry}
          confirmLabel="Confirm Claim All"
          wrongNetwork={wallet.wrongNetwork}
          onSwitchNetwork={wallet.switchToExpected}
          disabled={rows.length === 0}
        />
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border px-4">
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <ClaimRow
                key={r.asset.symbol}
                symbol={r.asset.symbol}
                name={r.asset.name}
                amount={r.claimable}
                decimals={r.decimals}
                claimableUsd={r.claimableUsd}
              />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Total</p>
            <p className="tabular text-right text-base font-bold tracking-tight text-fg">
              {totalUsd !== null ? (
                `≈ ${formatNumber(totalUsd, { style: 'currency', currency: 'USD' })}`
              ) : (
                <span className="text-sm font-semibold text-muted">
                  {rows.length} {rows.length === 1 ? 'asset' : 'assets'}
                </span>
              )}
            </p>
          </div>
        </div>
        <ClaimFeeBlock step={claim.step} gas={claim.gas} error={claim.error} />
        {wallet.wrongNetwork && (
          <p className="text-xs text-red">Your wallet is on a different network than the reward contract.</p>
        )}
        <ClaimProgress step={claim.step} txHash={claim.txHash} error={claim.error} />
      </div>
    </Modal>
  )
}
