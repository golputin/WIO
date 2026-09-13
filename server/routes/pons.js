import express from 'express'

const router = express.Router()
const UPSTREAM = 'https://www.ponsfamily.com/api/pons-v2-market'
const SUPPORTED = ['5m', '1h', '6h', '24h', '7d']

const validAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value ?? '')

export function normalizePoints(points) {
  return (Array.isArray(points) ? points : [])
    .map((point) => ({
      t: Number(point.t),
      price: Number(point.price),
      volumeQuote: Number(point.volumeQuote ?? 0),
      ...(point.blockNumber == null ? {} : { blockNumber: Number(point.blockNumber) }),
      ...(point.tradeCount == null ? {} : { tradeCount: Number(point.tradeCount) }),
    }))
    .filter((point) => Number.isFinite(point.t) && Number.isFinite(point.price) && point.price > 0)
    .sort((a, b) => a.t - b.t)
}

export function candlesFromPoints(points, quoteUsd) {
  const buckets = new Map()
  for (const point of points) {
    const key = Math.floor(point.t / 60) * 60
    const price = point.price * quoteUsd
    const current = buckets.get(key)
    if (!current) buckets.set(key, { t: key, o: price, h: price, l: price, c: price, v: point.volumeQuote * quoteUsd })
    else {
      current.h = Math.max(current.h, price)
      current.l = Math.min(current.l, price)
      current.c = price
      current.v += point.volumeQuote * quoteUsd
    }
  }
  return [...buckets.values()]
}

router.get('/', async (req, res) => {
  const address = String(req.query.address ?? '').trim()
  const range = String(req.query.range ?? '1h').toLowerCase()
  if (!validAddress(address)) return res.status(400).json({ error: 'Valid token address is required' })
  if (!SUPPORTED.includes(range)) return res.status(400).json({ error: `Unsupported range: ${range}`, supported: SUPPORTED })
  try {
    const upstream = await fetch(`${UPSTREAM}/${address}/chart?range=${encodeURIComponent(range)}`, { headers: { accept: 'application/json', 'user-agent': 'MarketLens/1.0' } })
    if (!upstream.ok) return res.status(502).json({ error: `Pons upstream HTTP ${upstream.status}`, source: 'PONS' })
    const payload = await upstream.json()
    const points = normalizePoints(payload.points)
    const quoteUsd = Number(payload.quoteUsd)
    res.set('Cache-Control', 'no-store, max-age=0')
    return res.json({
      token: address,
      range,
      intervalSeconds: Number(payload.intervalSeconds) || 15,
      points,
      candles: Number.isFinite(quoteUsd) && quoteUsd > 0 ? candlesFromPoints(points, quoteUsd) : [],
      updatedAt: Number(payload.updatedAt) || Date.now(),
      quoteSymbol: payload.quoteSymbol ?? 'ETH',
      quoteUsd: Number.isFinite(quoteUsd) ? quoteUsd : null,
      source: 'PONS',
    })
  } catch {
    return res.status(502).json({ error: 'Pons upstream unavailable', source: 'PONS' })
  }
})

export { router as pons }
