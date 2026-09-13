/**
 * Yahoo Finance public endpoints. No credentials required.
 * Used for quotes, charts, indices, search, trending, movers and headline news.
 *
 * Yahoo is an unofficial source: endpoints can change without notice. Every function
 * normalizes into the frontend's contracts (see src/api/*.js) so a provider swap is local.
 */
import { fetchJsonCached } from '../lib/http.js'

const Q1 = 'https://query1.finance.yahoo.com'
const PROVIDER = 'Yahoo Finance'
const TTL = { quote: 15_000, chart: 60_000, search: 300_000, movers: 60_000, news: 120_000 }

/** Frontend range -> Yahoo (range, interval). */
const RANGES = {
  '1D': ['1d', '5m'],
  '5D': ['5d', '15m'],
  '1W': ['5d', '15m'],
  '1M': ['1mo', '1d'],
  '3M': ['3mo', '1d'],
  '6M': ['6mo', '1d'],
  '1Y': ['1y', '1wk'],
  '5Y': ['5y', '1mo'],
}

const INDICES = [
  { symbol: '^GSPC', code: 'SPX', name: 'S&P 500' },
  { symbol: '^IXIC', code: 'NASDAQ', name: 'NASDAQ Composite' },
  { symbol: '^DJI', code: 'DOW', name: 'Dow Jones' },
  { symbol: '^RUT', code: 'RUT', name: 'Russell 2000' },
  { symbol: '^VIX', code: 'VIX', name: 'VIX' },
]

const iso = (unixSeconds) => new Date(unixSeconds * 1000).toISOString()
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

async function chartRaw(symbol, range = '1d', interval = '5m') {
  const url = `${Q1}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`
  const json = await fetchJsonCached(url, range === '1d' ? TTL.quote : TTL.chart, { provider: PROVIDER })
  const result = json?.chart?.result?.[0]
  if (!result?.meta) throw Object.assign(new Error(`No chart data for ${symbol}.`), { status: 404 })
  return result
}

/** Build a Quote from chart metadata (v7 /quote needs a session crumb; chart meta does not). */
function quoteFromMeta(meta, overrides = {}) {
  const price = num(meta.regularMarketPrice)
  const prev = num(meta.chartPreviousClose) ?? num(meta.previousClose)
  if (price === null) return null
  const change = prev !== null ? price - prev : null
  return {
    symbol: overrides.symbol ?? meta.symbol,
    name: overrides.name ?? meta.longName ?? meta.shortName ?? meta.symbol,
    price,
    change,
    changePercent: change !== null && prev ? (change / prev) * 100 : null,
    volume: num(meta.regularMarketVolume),
    currency: meta.currency ?? null,
    exchange: meta.exchangeName ?? null,
    asOf: meta.regularMarketTime ? iso(meta.regularMarketTime) : new Date().toISOString(),
  }
}

export async function getQuote(symbol) {
  const result = await chartRaw(symbol, '1d', '5m')
  return quoteFromMeta(result.meta)
}

export async function getQuotes(symbols) {
  const settled = await Promise.allSettled(symbols.map((s) => getQuote(s)))
  return settled.filter((r) => r.status === 'fulfilled' && r.value).map((r) => r.value)
}

export async function getIndices() {
  const settled = await Promise.allSettled(
    INDICES.map(async (ix) => {
      const { meta } = await chartRaw(ix.symbol, '1d', '1d')
      const q = quoteFromMeta(meta, { symbol: ix.code, name: ix.name })
      return q && { symbol: q.symbol, name: q.name, value: q.price, change: q.change, changePercent: q.changePercent, asOf: q.asOf }
    }),
  )
  return settled.filter((r) => r.status === 'fulfilled' && r.value).map((r) => r.value)
}

export async function getChart(symbol, range = '1D') {
  const [yRange, interval] = RANGES[range] ?? RANGES['1D']
  const result = await chartRaw(symbol, yRange, interval)
  const ts = result.timestamp ?? []
  const q = result.indicators?.quote?.[0] ?? {}
  const candles = []
  for (let i = 0; i < ts.length; i++) {
    const c = num(q.close?.[i])
    if (c === null) continue
    candles.push({ t: iso(ts[i]), o: num(q.open?.[i]) ?? c, h: num(q.high?.[i]) ?? c, l: num(q.low?.[i]) ?? c, c, v: num(q.volume?.[i]) ?? undefined })
  }
  return candles
}

const SEARCH_TYPES = new Set(['EQUITY', 'ETF', 'INDEX', 'MUTUALFUND'])

export async function search(q) {
  const url = `${Q1}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&enableFuzzyQuery=false`
  const json = await fetchJsonCached(url, TTL.search, { provider: PROVIDER })
  return (json?.quotes ?? [])
    .filter((r) => r.symbol && SEARCH_TYPES.has(r.quoteType))
    .map((r) => ({ symbol: r.symbol, name: r.shortname ?? r.longname ?? r.symbol, exchange: r.exchDisp ?? r.exchange ?? null, type: r.quoteType }))
}

/** Screener rows already carry full quote data. */
function quoteFromScreener(r) {
  const price = num(r.regularMarketPrice)
  if (price === null || !r.symbol) return null
  return {
    symbol: r.symbol,
    name: r.longName ?? r.shortName ?? r.symbol,
    price,
    change: num(r.regularMarketChange),
    changePercent: num(r.regularMarketChangePercent),
    volume: num(r.regularMarketVolume),
    marketCap: num(r.marketCap),
    currency: r.currency ?? null,
    exchange: r.fullExchangeName ?? r.exchange ?? null,
    asOf: r.regularMarketTime ? iso(r.regularMarketTime) : new Date().toISOString(),
  }
}

const SCREENERS = { gainers: 'day_gainers', losers: 'day_losers', volume: 'most_actives' }

export async function getMovers(type = 'gainers', count = 12) {
  if (type === 'trending') {
    const url = `${Q1}/v1/finance/trending/US?count=${count}`
    const json = await fetchJsonCached(url, TTL.movers, { provider: PROVIDER })
    const symbols = (json?.finance?.result?.[0]?.quotes ?? []).map((q) => q.symbol).filter(Boolean).slice(0, count)
    return getQuotes(symbols)
  }
  const scr = SCREENERS[type]
  if (!scr) throw Object.assign(new Error(`Unknown movers type "${type}".`), { status: 400 })
  const url = `${Q1}/v1/finance/screener/predefined/saved?scrIds=${scr}&count=${count}`
  const json = await fetchJsonCached(url, TTL.movers, { provider: PROVIDER })
  return (json?.finance?.result?.[0]?.quotes ?? []).map(quoteFromScreener).filter(Boolean)
}

/** Headlines for a symbol, or general market news when symbol is empty. */
export async function getNews(symbol, limit = 10) {
  const q = symbol ? symbol : 'stock market'
  const url = `${Q1}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=0&newsCount=${Math.min(limit, 20)}`
  const json = await fetchJsonCached(url, TTL.news, { provider: PROVIDER })
  return (json?.news ?? [])
    .filter((n) => n.title && n.link)
    .map((n) => ({
      id: n.uuid ?? n.link,
      headline: n.title,
      source: n.publisher ?? 'Yahoo Finance',
      url: n.link,
      publishedAt: n.providerPublishTime ? iso(n.providerPublishTime) : new Date().toISOString(),
      symbols: Array.isArray(n.relatedTickers) ? n.relatedTickers : undefined,
    }))
    .slice(0, limit)
}
