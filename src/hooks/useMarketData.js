import { useCallback } from 'react'
import * as marketApi from '../api/marketApi.js'
import * as newsApi from '../api/newsApi.js'
import * as filingsApi from '../api/filingsApi.js'
import * as analyticsApi from '../api/analyticsApi.js'
import { useAsyncResource } from './useAsyncResource.js'

const QUOTE_REFRESH_MS = 15_000
const INDEX_REFRESH_MS = 20_000

export function useMarketStatus() {
  return useAsyncResource((signal) => marketApi.getMarketStatus(signal), { refreshMs: 60_000 })
}

export function useIndices() {
  return useAsyncResource((signal) => marketApi.getIndices(signal), { refreshMs: INDEX_REFRESH_MS })
}

export function useQuotes(symbols) {
  const key = Array.isArray(symbols) ? symbols.join(',') : ''
  const fetcher = useCallback((signal) => marketApi.getQuotes(key ? key.split(',') : [], signal), [key])
  return useAsyncResource(fetcher, { refreshMs: QUOTE_REFRESH_MS, deps: [key] })
}

export function useQuote(symbol) {
  const fetcher = useCallback((signal) => marketApi.getQuote(symbol, signal), [symbol])
  return useAsyncResource(fetcher, { enabled: Boolean(symbol), refreshMs: QUOTE_REFRESH_MS, deps: [symbol] })
}

export function useChart(symbol, range = '1D') {
  const fetcher = useCallback((signal) => marketApi.getChart(symbol, range, signal), [symbol, range])
  return useAsyncResource(fetcher, { enabled: Boolean(symbol), deps: [symbol, range] })
}

export function useMovers(type) {
  const fetcher = useCallback((signal) => marketApi.getMovers(type, signal), [type])
  return useAsyncResource(fetcher, { refreshMs: 60_000, deps: [type] })
}

export function useEarnings(range) {
  const fetcher = useCallback((signal) => marketApi.getEarnings(range, signal), [range])
  return useAsyncResource(fetcher, { deps: [range] })
}

export function useMarketEvents() {
  return useAsyncResource((signal) => marketApi.getMarketEvents(signal))
}

export function useNews(params) {
  const symbol = params?.symbol ?? ''
  const limit = params?.limit ?? 20
  const fetcher = useCallback((signal) => newsApi.getNews({ symbol: symbol || undefined, limit }, signal), [symbol, limit])
  return useAsyncResource(fetcher, { deps: [symbol, limit] })
}

export function useDailyBrief() {
  return useAsyncResource((signal) => newsApi.getDailyBrief(signal))
}

export function useRecentFilings(params) {
  const symbol = params?.symbol ?? ''
  const limit = params?.limit ?? 20
  const fetcher = useCallback(
    (signal) => filingsApi.getFilings({ symbol: symbol || undefined, limit }, signal),
    [symbol, limit],
  )
  return useAsyncResource(fetcher, { deps: [symbol, limit] })
}

export function useLatestFilingAnalysis(symbol) {
  const fetcher = useCallback((signal) => filingsApi.getLatestFilingAnalysis(symbol, signal), [symbol])
  return useAsyncResource(fetcher, { enabled: Boolean(symbol), deps: [symbol] })
}

export function useMovementAnalysis(symbol) {
  const fetcher = useCallback((signal) => analyticsApi.getMovementAnalysis(symbol, signal), [symbol])
  return useAsyncResource(fetcher, { enabled: Boolean(symbol), deps: [symbol] })
}

/** Debounced asset search. Returns { results, state, error }. */
export function useAssetSearch(query) {
  const q = (query ?? '').trim()
  const fetcher = useCallback((signal) => marketApi.searchAssets(q, signal), [q])
  const res = useAsyncResource(fetcher, { enabled: q.length >= 1, deps: [q] })
  return { ...res, results: Array.isArray(res.data) ? res.data : [] }
}
