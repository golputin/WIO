import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { providers } from '../config/environment.js'
import { useAssetSearch } from '../hooks/useMarketData.js'
import { useDebounce } from '../hooks/useDebounce.js'
import EmptyState from './EmptyState.jsx'
import { Skeleton } from './LoadingState.jsx'

/**
 * Global asset search. Results come from the market provider; without one we say so.
 * `onSelect(symbol)` overrides default navigation to /markets?symbol=.
 */
export default function SearchDialog({ open, onClose, onSelect, placeholder = 'Search stocks, ETFs, indices' }) {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 250)
  const { results, state, error } = useAssetSearch(open ? debounced : '')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const select = (symbol) => {
    onClose()
    if (onSelect) onSelect(symbol)
    else navigate(`/markets?symbol=${encodeURIComponent(symbol)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-navy/30 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search assets"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-white shadow-float"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results[0]) select(results[0].symbol)
                }}
                placeholder={placeholder}
                className="h-14 w-full bg-transparent text-base text-navy outline-none placeholder:text-muted/70"
                aria-label="Search assets"
              />
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-light" aria-label="Close search">
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {!providers.market ? (
                <EmptyState
                  compact
                  title="Market data provider is not configured."
                  description="Asset search requires a live market data connection."
                />
              ) : debounced.trim() === '' ? (
                <p className="px-3 py-6 text-center text-sm text-muted">Type a ticker or company name to search live markets.</p>
              ) : state === 'loading' ? (
                <div className="space-y-2 p-2" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <Skeleton className="h-8 w-14" />
                      <Skeleton className="h-3.5 w-48" />
                    </div>
                  ))}
                </div>
              ) : state === 'unavailable' ? (
                <EmptyState compact icon="error" title="Unable to search assets." description={error?.message} />
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">No assets match “{debounced}”.</p>
              ) : (
                <ul role="listbox">
                  {results.map((r) => (
                    <li key={`${r.symbol}-${r.exchange ?? ''}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected="false"
                        onClick={() => select(r.symbol)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-light"
                      >
                        <span className="inline-flex min-w-14 items-center justify-center rounded-lg bg-light px-2 py-1.5 font-mono text-xs font-semibold text-navy group-hover:bg-white">
                          {r.symbol}
                        </span>
                        <span className="flex-1 truncate text-sm text-navy">{r.name}</span>
                        {r.exchange && <span className="hidden text-xs text-muted sm:block">{r.exchange}</span>}
                        <ArrowRight className="size-4 text-muted opacity-0 transition group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
