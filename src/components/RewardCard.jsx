import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { formatNumber, formatTokenAmount, isZeroRaw } from '../utils/formatters.js'
import { Skeleton } from './LoadingState.jsx'
import { Badge } from './ui.jsx'

/** Two-letter monogram for a reward asset; brand-neutral, no third-party logos. */
export function AssetMonogram({ symbol, size = 'md', className = '' }) {
  const cls = size === 'sm' ? 'size-8 text-[11px]' : 'size-11 text-sm'
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-light font-bold tracking-tight text-navy ${cls} ${className}`}
    >
      {String(symbol ?? '').slice(0, 2).toUpperCase()}
    </span>
  )
}

/**
 * One reward asset with its live claimable balance.
 * `row` comes from useRewardBalances(): { asset, claimable, decimals, claimableUsd }.
 * The balance is rendered only when the backend returned it; a missing value shows "unavailable".
 */
export default function RewardCard({ row, onClaim, busy = false, index = 0 }) {
  const { asset, claimable, decimals, claimableUsd } = row
  const hasBalance = claimable !== null && claimable !== undefined
  const zero = hasBalance && isZeroRaw(claimable)
  const amount = hasBalance ? formatTokenAmount(claimable, decimals) : null
  const usd = claimableUsd !== null && claimableUsd !== undefined ? formatNumber(Number(claimableUsd), { style: 'currency', currency: 'USD' }) : null
  const canClaim = asset.enabled && hasBalance && !zero && !busy

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="card card-hover flex flex-col gap-4 p-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <AssetMonogram symbol={asset.symbol} />
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight text-navy">{asset.symbol}</p>
          <p className="truncate text-xs text-muted">{asset.name}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Claimable</p>
          {!asset.enabled ? (
            <Badge tone="muted">Paused</Badge>
          ) : zero ? (
            <Badge tone="muted">Nothing to claim</Badge>
          ) : hasBalance ? (
            <Badge tone="green" dot>
              Ready
            </Badge>
          ) : null}
        </div>
        {amount !== null ? (
          <>
            <p className="tabular mt-1 text-2xl font-bold tracking-tight text-navy">
              {amount} <span className="text-sm font-semibold text-muted">{asset.symbol}</span>
            </p>
            {usd && <p className="tabular mt-0.5 text-xs text-muted">≈ {usd}</p>}
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">Balance unavailable.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClaim?.(row)}
        disabled={!canClaim}
        className={`${canClaim ? 'btn-primary' : 'btn-secondary'} mt-auto w-full`}
      >
        Claim {canClaim && <ArrowRight className="size-4" />}
      </button>
    </motion.article>
  )
}

export function RewardCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4 p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-32" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}
