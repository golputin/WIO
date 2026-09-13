import { Router } from 'express'
import { clampInt, cleanSymbol, route } from '../lib/route.js'
import * as finnhub from '../providers/finnhub.js'
import * as yahoo from '../providers/yahoo.js'

/** Mounted at /news — mirrors src/api/newsApi.js. */
export const news = Router()

news.get('/news', route(async (req) => {
  const symbol = cleanSymbol(req.query.symbol)
  const limit = clampInt(req.query.limit, 10, 1, 25)
  if (symbol && finnhub.configured()) {
    try {
      const items = await finnhub.getCompanyNews(symbol, limit)
      if (items.length) return items
    } catch {
      /* fall through to Yahoo */
    }
  }
  return yahoo.getNews(symbol, limit)
}))

const pct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
const fmt = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 2 })

/** Sentence built strictly from live index values. */
function overviewFromIndices(indices) {
  const majors = indices.filter((ix) => ['SPX', 'NASDAQ', 'DOW'].includes(ix.symbol) && typeof ix.changePercent === 'number')
  const parts = majors.map((ix) => `${ix.name} ${ix.changePercent >= 0 ? 'up' : 'down'} ${pct(ix.changePercent)} at ${fmt(ix.value)}`)
  if (!parts.length) return null
  const ups = majors.filter((ix) => ix.changePercent > 0).length
  const tone = ups === majors.length ? 'Broad gains across major indices.' : ups === 0 ? 'Major indices trading lower.' : 'Mixed session across major indices.'
  return `${tone} ${parts.join('; ')}.`
}

/**
 * MarketLens Daily — assembled server-side from live indices, movers, headlines and (when
 * Finnhub is configured) today's earnings. Nothing here is written by hand.
 */
news.get('/brief', route(async () => {
  const [indices, movers, headlines, earningsToday] = await Promise.all([
    yahoo.getIndices(),
    yahoo.getMovers('gainers', 6).catch(() => []),
    yahoo.getNews('', 6).catch(() => []),
    finnhub.configured() ? finnhub.getEarnings('today').catch(() => []) : Promise.resolve(null),
  ])
  const asOf = indices[0]?.asOf ?? new Date().toISOString()
  const sources = [{ label: 'Yahoo Finance', url: 'https://finance.yahoo.com' }]
  if (finnhub.configured()) sources.push({ label: 'Finnhub', url: 'https://finnhub.io' })
  return {
    date: asOf,
    overview: overviewFromIndices(indices),
    indices,
    topMovers: movers.slice(0, 5),
    whatMatters: headlines.slice(0, 5).map((n) => ({ title: n.headline, source: n.source, url: n.url })),
    earningsToday: earningsToday ? earningsToday.slice(0, 8) : null,
    upcomingEvents: [],
    sources,
    generatedAt: new Date().toISOString(),
  }
}))
