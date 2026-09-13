import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { explorerLink } from '../config/environment.js'
import { CLAIM_STEP_LABEL, useClaim } from '../hooks/useClaim.js'
import { useWallet } from '../hooks/useWallet.jsx'
import { formatGwei, formatNumber, formatTokenAmount, formatWeiToNative, shortHash } from '../utils/formatters.js'
import { Skeleton } from './LoadingState.jsx'
import Modal from './Modal.jsx'
import { AssetMonogram } from './RewardCard.jsx'

const BUSY_STEPS = new Set(['estimating', 'preparing', 'awaiting_wallet', 'submitted', 'confirming'])
const LOCKED_STEPS = new Set(['preparing', 'awaiting_wallet', 'submitted', 'confirming'])

/* ───────────────────────────── shared building blocks ───────────────────────────── */

export function ClaimRow({ symbol, name, amount, decimals, claimableUsd, emphasis = false }) {
  const formatted = formatTokenAmount(amount, decimals)
  const usd =
    claimableUsd !== null && claimableUsd !== undefined
      ? formatNumber(Number(claimableUsd), { style: 'currency', currency: 'USD' })
      : null
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <AssetMonogram symbol={symbol} size="sm" />
        <div className="min-w-0">
          <p className={`font-semibold text-navy ${emphasis ? 'text-base' : 'text-sm'}`}>{symbol}</p>
          {name && <p className="truncate text-xs text-muted">{name}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={`tabular font-bold tracking-tight text-navy ${emphasis ? 'text-lg' : 'text-sm'}`}>
          {formatted ?? <span className="text-muted">Unavailable</span>}
        </p>
        {usd && <p className="tabular text-xs text-muted">≈ {usd}</p>}
      </div>
    </div>
  )
}

/** Live network fee. Rendered only from wallet / backend estimates. */
export function ClaimFeeBlock({ step, gas, error }) {
  const total = gas ? formatWeiToNative(gas.totalWei) : null
  const symbol = gas?.nativeSymbol ?? ''
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Estimated network fee</p>
        {step === 'estimating' && <Loader2 className="size-3.5 animate-spin text-blue" aria-hidden="true" />}
      </div>
      {step === 'estimating' ? (
        <div className="mt-2 space-y-2" aria-busy="true">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ) : gas ? (
        <>
          <p className="tabular mt-1.5 text-lg font-bold tracking-tight text-navy">
            {total} {symbol}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
            <dt>Estimated gas</dt>
            <dd className="tabular text-right text-navy">{formatNumber(Number(gas.gasLimit))}</dd>
            <dt>Gas price</dt>
            <dd className="tabular text-right text-navy">{formatGwei(gas.gasPriceWei)}</dd>
          </dl>
        </>
      ) : (
        <p className="mt-1.5 text-sm text-muted">{error?.message ?? 'Fee estimate unavailable.'}</p>
      )}
    </div>
  )
}

/** Transaction lifecycle — driven exclusively by wallet / network responses. */
export function ClaimProgress({ step, txHash, error }) {
  if (step === 'idle' || step === 'ready' || step === 'estimating') return null
  const link = explorerLink('tx', txHash)
  const isBusy = BUSY_STEPS.has(step)
  const isSuccess = step === 'success'
  const isBad = step === 'failed' || step === 'rejected' || step === 'unavailable'
  const Icon = isSuccess ? CheckCircle2 : isBad ? XCircle : Loader2
  const tone = isSuccess ? 'border-green/30 bg-green-100 text-[#0f8a5f]' : isBad ? 'border-red/30 bg-red-100 text-red' : 'border-blue-100 bg-light text-blue'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${tone}`}
      >
        <Icon className={`mt-0.5 size-4 shrink-0 ${isBusy ? 'animate-spin' : ''}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{CLAIM_STEP_LABEL[step] ?? step}</p>
          {isBad && error?.message && error.message !== CLAIM_STEP_LABEL[step] && <p className="mt-0.5 text-xs opacity-80">{error.message}</p>}
          {txHash && (
            <p className="mt-1 font-mono text-xs">
              {link ? (
                <a href={link} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                  {shortHash(txHash)} <ExternalLink className="size-3" />
                </a>
              ) : (
                shortHash(txHash)
              )}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function ClaimFooter({ step, onConfirm, onClose, onRetry, confirmLabel, wrongNetwork, onSwitchNetwork, disabled }) {
  if (step === 'success') {
    return (
      <button type="button" onClick={onClose} className="btn-primary w-full">
        Done
      </button>
    )
  }
  if (wrongNetwork) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button type="button" onClick={onSwitchNetwork} className="btn-primary flex-1">
          <AlertTriangle className="size-4" /> Switch network
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    )
  }
  if (step === 'failed' || step === 'rejected' || step === 'unavailable') {
    return (
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button type="button" onClick={onRetry} className="btn-primary flex-1">
          Try again
        </button>
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Close
        </button>
      </div>
    )
  }
  const busy = BUSY_STEPS.has(step)
  return (
    <div className="flex flex-col gap-2 sm:flex-row-reverse">
      <button type="button" onClick={onConfirm} disabled={busy || disabled || step !== 'ready'} className="btn-primary flex-1" aria-busy={busy}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {confirmLabel}
      </button>
      <button type="button" onClick={onClose} disabled={LOCKED_STEPS.has(step)} className="btn-secondary flex-1">
        Cancel
      </button>
    </div>
  )
}

/** Shared controller: run a live estimate when the dialog opens, reset when it closes. */
export function useClaimDialog({ open, symbols, onSuccess }) {
  const claim = useClaim()
  const key = symbols.join(',')

  useEffect(() => {
    if (open && key) claim.estimate(key.split(','))
    if (!open) claim.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key])

  useEffect(() => {
    if (claim.step === 'success') onSuccess?.(claim.txHash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim.step])

  return { ...claim, locked: LOCKED_STEPS.has(claim.step), retry: () => claim.estimate(key.split(',')) }
}

/* ───────────────────────────── individual claim ───────────────────────────── */

/**
 * Claim a single reward asset. `row` = { asset, claimable, decimals, claimableUsd } (live).
 */
export default function ClaimModal({ open, onClose, row, onSuccess }) {
  const wallet = useWallet()
  const symbols = row ? [row.asset.symbol] : []
  const claim = useClaimDialog({ open, symbols, onSuccess })

  if (!row) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={claim.locked}
      title={`Claim ${row.asset.symbol} Rewards`}
      description="Your wallet signs the transaction. MarketLens never holds your keys."
      footer={
        <ClaimFooter
          step={claim.step}
          onConfirm={claim.confirm}
          onClose={onClose}
          onRetry={claim.retry}
          confirmLabel="Confirm Claim"
          wrongNetwork={wallet.wrongNetwork}
          onSwitchNetwork={wallet.switchToExpected}
        />
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border px-4">
          <p className="pt-3 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Claimable</p>
          <ClaimRow
            symbol={row.asset.symbol}
            name={row.asset.name}
            amount={row.claimable}
            decimals={row.decimals}
            claimableUsd={row.claimableUsd}
            emphasis
          />
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
