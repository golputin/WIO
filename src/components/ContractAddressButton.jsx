import { Check, Copy, Lock } from 'lucide-react'
import { useState } from 'react'
import { token } from '../config/token.js'
import { shortAddress } from '../utils/formatters.js'

const SIZES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
}

/**
 * Copy-to-clipboard button for the official token contract address.
 * Locked (disabled) until VITE_TOKEN_ADDRESS is configured — never shows a placeholder address.
 */
export default function ContractAddressButton({ size = 'sm', full = false, className = '' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!token.live) return
    try {
      await navigator.clipboard.writeText(token.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  const base = `inline-flex items-center gap-2 rounded-lg border font-mono font-medium whitespace-nowrap transition ${SIZES[size]} ${className}`

  if (!token.live) {
    return (
      <span
        className={`${base} cursor-not-allowed border-dashed border-border text-dim`}
        title="Contract address will be published at launch"
        aria-disabled="true"
      >
        <Lock className="size-3.5" /> CA · not launched
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`${base} border-gold/40 bg-gold/10 text-fg hover:-translate-y-px hover:border-gold hover:bg-gold/15 active:scale-[0.98]`}
      aria-label={copied ? 'Contract address copied' : 'Copy contract address'}
      title={token.address}
    >
      <span className="text-[10px] tracking-wider text-gold uppercase">CA</span>
      <span className="tabular">{full ? token.address : shortAddress(token.address, 4)}</span>
      {copied ? <Check className="size-3.5 text-green" /> : <Copy className="size-3.5 text-muted" />}
    </button>
  )
}
