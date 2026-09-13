import { Router } from 'express'
import { cached } from '../lib/cache.js'
import { cleanSymbol, route } from '../lib/route.js'
import * as finnhub from '../providers/finnhub.js'
import * as llm from '../providers/llm.js'
import * as sec from '../providers/sec.js'
import * as yahoo from '../providers/yahoo.js'

/** Mounted at /analytics — mirrors src/api/analyticsApi.js. */
export const analytics = Router()

const HOURS = 60 * 60_000
const pct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
const SENTIMENT_TTL = 15 * 60_000

const SENTIMENT_SYSTEM_PROMPT = `You classify market sentiment from evidence only. Do not predict prices and do not add outside knowledge.
Return JSON only: {"label":"Bullish|Neutral|Bearish|null","score":number|null,"confidence":number|null}. Confidence is evidence strength, not probability. Use null when evidence is insufficient.
Use null for both when evidence is insufficient or contradictory. Score is evidence direction strength from 0 to 100, not probability of a price move.
Bullish means the retrieved evidence leans positive, Bearish means it leans negative, Neutral means balanced or non-directional.`

function normalizeSentiment(raw) {
  const label = raw?.label
  const score = raw?.score
  const confidence = raw?.confidence
  if (label === null || score === null || confidence === null) return null
  if (!['Bullish', 'Neutral', 'Bearish'].includes(label) || !Number.isFinite(score) || !Number.isFinite(confidence)) return null
  return {
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    confidence: Math.max(0, Math.min(100, Math.round(confidence))),
  }
}

async function analyzeSentiment(symbol, evidence) {
  if (!llm.configured() || evidence.sources.length === 0) return null
  return cached(`sentiment:${symbol}:${JSON.stringify(evidence)}`, SENTIMENT_TTL, async () => {
    try {
      return normalizeSentiment(await llm.completeJson(SENTIMENT_SYSTEM_PROMPT, JSON.stringify(evidence)))
    } catch {
      return null
    }
  })
}

/**
 * "Why Is It Moving?" — assembled only from retrieved sources:
 *  - recent headlines mentioning the symbol (news factors, each with a source link)
 *  - a new SEC filing in the last 3 days (filing factor)
 *  - the live price/volume move itself (signal factor)
 * If none of those exist, catalystDetected=false and the UI shows "No verified catalyst detected yet."
 * Sentiment and confidence stay null: we do not score sentiment without a scoring provider.
 */
analytics.get('/why-moving/:symbol', route(async (req) => {
  const symbol = cleanSymbol(req.params.symbol)
  const now = Date.now()
  const [quote, newsItems, filingsList] = await Promise.all([
    yahoo.getQuote(symbol),
    (finnhub.configured() ? finnhub.getCompanyNews(symbol, 8).catch(() => []) : Promise.resolve([])).then((items) => (items.length ? items : yahoo.getNews(symbol, 8).catch(() => []))),
    sec.configured() ? sec.getFilings(symbol, 3).catch(() => []) : Promise.resolve([]),
  ])
  if (!quote) throw Object.assign(new Error(`No quote for ${symbol}.`), { status: 404 })

  const factors = []
  const sources = []

  for (const n of newsItems.filter((n) => now - new Date(n.publishedAt).getTime() < 48 * HOURS).slice(0, 3)) {
    factors.push({ type: 'news', title: n.headline, detail: n.summary, sourceLabel: n.source, sourceUrl: n.url, observedAt: n.publishedAt })
    sources.push({ label: n.source, url: n.url })
  }

  const recentFiling = filingsList.find((f) => now - new Date(f.filedAt).getTime() < 72 * HOURS)
  if (recentFiling) {
    factors.push({ type: 'filing', title: `New ${recentFiling.formType} filed with the SEC`, detail: recentFiling.description, sourceLabel: 'SEC EDGAR', sourceUrl: recentFiling.url, observedAt: recentFiling.filedAt })
    sources.push({ label: `SEC Filing (${recentFiling.formType})`, url: recentFiling.url })
  }

  if (typeof quote.changePercent === 'number' && Math.abs(quote.changePercent) >= 1) {
    factors.push({
      type: 'signal',
      title: `${symbol} is ${quote.changePercent >= 0 ? 'up' : 'down'} ${pct(quote.changePercent)} this session`,
      detail: quote.volume ? `Session volume ${quote.volume.toLocaleString('en-US')} shares.` : undefined,
      sourceLabel: 'Yahoo Finance',
      observedAt: quote.asOf,
    })
  }
  sources.push({ label: 'Yahoo Finance', url: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}` })

  const catalystDetected = factors.some((f) => f.type === 'news' || f.type === 'filing')
  const evidence = {
    symbol,
    quote: { price: quote.price, change: quote.change, changePercent: quote.changePercent, volume: quote.volume, asOf: quote.asOf },
    factors: factors.map(({ type, title, detail, sourceLabel, observedAt }) => ({ type, title, detail, sourceLabel, observedAt })),
    sources: sources.map(({ label, url }) => ({ label, url })),
  }
  const analysis = await analyzeSentiment(symbol, evidence)
  const sentiment = analysis ? { label: analysis.label, score: analysis.score } : null
  const confidence = analysis?.confidence ?? null
  return { symbol, quote, catalystDetected, factors, sentiment, confidence, sources, generatedAt: new Date().toISOString() }
}))

function evidenceStrength({ factors, sources, quote }) {
  let score = 20
  score += Math.min(30, factors.filter((f) => f.type === 'news').length * 10)
  score += factors.some((f) => f.type === 'filing') ? 20 : 0
  score += factors.some((f) => f.type === 'signal') ? 15 : 0
  score += sources.length >= 3 ? 10 : sources.length >= 2 ? 5 : 0
  score += typeof quote.volume === 'number' ? 5 : 0
  return Math.min(100, score)
}

// Sentiment scoring needs a dedicated provider; report absence instead of inventing a score.
analytics.get('/sentiment/:symbol', route(() => {
  throw Object.assign(new Error('Sentiment provider is not configured.'), { status: 503, code: 'not_configured' })
}))
