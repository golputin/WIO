import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, Copy, LogOut, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import { shortAddress } from '../utils/formatters.js'

export default function WalletConnect({ size = 'md', className = '' }) {
  const wallet = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const sizeCls = size === 'sm' ? '!px-3.5 !py-2 text-xs' : ''

  if (!wallet.isConnected) {
    const busy = wallet.status === 'connecting'
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={wallet.connect}
          disabled={busy}
          className={`btn-secondary ${sizeCls}`}
          aria-busy={busy}
        >
          <Wallet className="size-4" />
          {busy ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {wallet.error && wallet.status !== 'connecting' && (
          <p role="alert" className="absolute top-full right-0 mt-2 w-64 rounded-lg border border-border bg-white p-2.5 text-xs text-muted shadow-card">
            {wallet.error.message}
            <button type="button" onClick={wallet.clearError} className="ml-2 text-blue hover:underline">
              Dismiss
            </button>
          </p>
        )}
      </div>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`btn-secondary ${sizeCls}`}
      >
        {wallet.wrongNetwork ? (
          <AlertTriangle className="size-4 text-red" />
        ) : (
          <span className="size-2 rounded-full bg-green" aria-hidden="true" />
        )}
        <span className="font-mono text-xs">{shortAddress(wallet.address)}</span>
        <ChevronDown className="size-3.5 text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-float"
          >
            <div className="px-3 py-2">
              <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">Connected</p>
              <p className="mt-0.5 font-mono text-xs break-all text-navy">{wallet.address}</p>
              {wallet.chainId && <p className="mt-1 text-xs text-muted">Chain ID {wallet.chainId}</p>}
            </div>
            {wallet.wrongNetwork && (
              <button
                type="button"
                role="menuitem"
                onClick={wallet.switchToExpected}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red hover:bg-red-100"
              >
                <AlertTriangle className="size-4" /> Switch to expected network
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={copy}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-light"
            >
              <Copy className="size-4" /> {copied ? 'Copied' : 'Copy address'}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                wallet.disconnect()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-light"
            >
              <LogOut className="size-4" /> Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
