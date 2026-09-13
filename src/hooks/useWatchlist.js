import { useCallback, useEffect, useState } from 'react'
import * as watchlistApi from '../api/watchlistApi.js'
import { providers } from '../config/environment.js'

/**
 * Watchlist symbols (not prices — prices are fetched live via useQuotes).
 *
 * mode:
 *   'backend' — persisted through the authenticated user backend (production)
 *   'local'   — browser storage only; development fallback, clearly labelled in the UI
 */
const LOCAL_KEY = 'marketlens.dev.watchlist'

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

function writeLocal(symbols) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(symbols))
  } catch {
    /* storage unavailable */
  }
}

export function useWatchlist() {
  const mode = providers.user ? 'backend' : 'local'
  const [symbols, setSymbols] = useState(() => (mode === 'local' ? readLocal() : []))
  const [state, setState] = useState(mode === 'backend' ? 'loading' : 'ok')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mode !== 'backend') return undefined
    const controller = new AbortController()
    ;(async () => {
      const res = await watchlistApi.getWatchlist(controller.signal)
      if (controller.signal.aborted) return
      if (res.status === 'ok') {
        setSymbols(Array.isArray(res.data?.symbols) ? res.data.symbols : [])
        setState('ok')
      } else if (res.reason !== 'aborted') {
        setError(res.message)
        setState('unavailable')
      }
    })()
    return () => controller.abort()
  }, [mode])

  const persist = useCallback(
    async (next) => {
      setSymbols(next)
      if (mode === 'local') {
        writeLocal(next)
        return
      }
      const res = await watchlistApi.putWatchlist(next)
      if (res.status !== 'ok') setError(res.message)
    },
    [mode],
  )

  const add = useCallback(
    (symbol) => {
      const s = symbol.toUpperCase()
      if (symbols.includes(s)) return
      persist([...symbols, s])
    },
    [symbols, persist],
  )

  const remove = useCallback((symbol) => persist(symbols.filter((s) => s !== symbol.toUpperCase())), [symbols, persist])

  const has = useCallback((symbol) => symbols.includes(symbol.toUpperCase()), [symbols])

  return { symbols, add, remove, has, state, error, mode }
}
