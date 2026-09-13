import { AnimatePresence, motion } from 'framer-motion'
import { FlaskConical, ListPlus, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { providers } from '../config/environment.js'
import { useQuotes } from '../hooks/useMarketData.js'
import { useWatchlist } from '../hooks/useWatchlist.js'
import { formatRelative } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import { QuoteListSkeleton, QuoteRow } from './QuoteList.jsx'
import SearchDialog from './SearchDialog.jsx'
import { Badge } from './ui.jsx'

/**
 * Watchlist: symbols persisted via the user backend (production) or local storage (development,
 * labelled). Prices are always fetched live; symbols without a live quote are listed as pending.
 */
export default function Watchlist() {
  const wl = useWatchlist()
  const quotes = useQuotes(providers.market ? wl.symbols : [])
  const [searchOpen, setSearchOpen] = useState(false)

  const bySymbol = new Map((quotes.state === 'ok' && Array.isArray(quotes.data) ? quotes.data : []).map((q) => [q.symbol?.toUpperCase(), q]))
  const rows = wl.symbols.map((s) => ({ symbol: s, quote: bySymbol.get(s) ?? null }))

  return (
    <section aria-labelledby="watchlist-heading" className="card overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Watchlist</p>
            {wl.mode === 'local' && (
              <Badge tone="muted" className="normal-case">
                <FlaskConical className="size-3" /> Local dev storage
              </Badge>
            )}
          </div>
          <h2 id="watchlist-heading" className="mt-1 text-xl font-bold tracking-tight text-fg sm:text-2xl">
            {wl.symbols.length > 0 ? `${wl.symbols.length} ${wl.symbols.length === 1 ? 'asset' : 'assets'}` : 'Your assets'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {quotes.state === 'ok' && quotes.updatedAt && (
            <span className="hidden text-xs text-muted sm:inline">Updated {formatRelative(new Date(quotes.updatedAt).toISOString())}</span>
          )}
          {providers.market && wl.symbols.length > 0 && (
            <button type="button" onClick={quotes.refresh} className="btn-ghost !px-3 !py-2 text-xs" aria-label="Refresh quotes">
              <RefreshCw className={`size-3.5 ${quotes.state === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button type="button" onClick={() => setSearchOpen(true)} className="btn-primary !px-4 !py-2 text-xs">
            <Plus className="size-3.5" /> Add asset
          </button>
        </div>
      </header>

      {wl.mode === 'local' && (
        <p className="border-b border-border bg-bg px-5 py-2 text-xs text-muted sm:px-6">
          Authentication backend not configured — this list is stored only in this browser. Connect VITE_USER_API_URL for
          account-level persistence.
        </p>
      )}

      <div className="px-5 sm:px-6">
        {wl.state === 'loading' ? (
          <QuoteListSkeleton rows={4} />
        ) : wl.state === 'unavailable' ? (
          <EmptyState icon="error" title="Unable to load your watchlist." description={wl.error} />
        ) : wl.symbols.length === 0 ? (
          <EmptyState
            icon={ListPlus}
            title="Your watchlist is empty."
            description="Search for stocks, ETFs or indices to track their live price and activity."
            action={
              <button type="button" onClick={() => setSearchOpen(true)} className="btn-primary !px-4 !py-2 text-xs">
                <Plus className="size-3.5" /> Add your first asset
              </button>
            }
          />
        ) : !providers.market ? (
          <>
            <EmptyState compact title="Market data provider is not configured." description="Symbols are saved; live prices will appear once VITE_MARKET_API_URL is connected." />
            <SymbolOnlyList symbols={wl.symbols} onRemove={wl.remove} />
          </>
        ) : quotes.state === 'loading' && bySymbol.size === 0 ? (
          <QuoteListSkeleton rows={Math.min(wl.symbols.length, 6)} />
        ) : quotes.state === 'unavailable' ? (
          <>
            <EmptyState
              compact
              icon={quotes.error?.reason === 'network' ? 'network' : 'error'}
              title="Unable to load live prices."
              description={quotes.error?.message}
              onRetry={quotes.refresh}
            />
            <SymbolOnlyList symbols={wl.symbols} onRemove={wl.remove} />
          </>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {rows.map(({ symbol, quote }) =>
                quote ? (
                  <motion.div key={symbol} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                    <QuoteRow q={quote} onRemove={wl.remove} />
                  </motion.div>
                ) : (
                  <motion.li key={symbol} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="font-semibold text-fg">{symbol}</span>
                    <span className="text-xs text-muted">Quote unavailable from provider</span>
                    <button type="button" onClick={() => wl.remove(symbol)} className="text-xs text-muted hover:text-red">
                      Remove
                    </button>
                  </motion.li>
                ),
              )}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={(s) => wl.add(s)} placeholder="Add to watchlist" />
    </section>
  )
}

function SymbolOnlyList({ symbols, onRemove }) {
  return (
    <ul className="divide-y divide-border border-t border-border">
      {symbols.map((s) => (
        <li key={s} className="flex items-center justify-between gap-3 py-3 text-sm">
          <span className="font-semibold text-fg">{s}</span>
          <button type="button" onClick={() => onRemove(s)} className="text-xs text-muted hover:text-red">
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
