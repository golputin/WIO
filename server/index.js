/**
 * MarketLens data backend.
 *
 * The browser never talks to vendors directly: this process holds credentials (server-side .env)
 * and exposes the JSON contracts defined in src/api/*.js. Point the frontend at it with:
 *   VITE_MARKET_API_URL=http://localhost:8787/market
 *   VITE_NEWS_API_URL=http://localhost:8787/news
 *   VITE_FILINGS_API_URL=http://localhost:8787/filings
 *   VITE_ANALYTICS_API_URL=http://localhost:8787/analytics
 */
import cors from 'cors'
import express from 'express'
import { cacheSize } from './lib/cache.js'
import * as finnhub from './providers/finnhub.js'
import * as llm from './providers/llm.js'
import * as sec from './providers/sec.js'
import { alerts } from './routes/alerts.js'
import { rewards } from './routes/rewards.js'
import { analytics } from './routes/analytics.js'
import { filings } from './routes/filings.js'
import { market } from './routes/market.js'
import { news } from './routes/news.js'
import { pons } from './routes/pons.js'

const PORT = Number(process.env.PORT) || 8787
const ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((s) => s.trim()).filter(Boolean)

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(express.json({ limit: '64kb' }))
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || ORIGINS.includes('*') || ORIGINS.includes(origin)),
    credentials: true,
  }),
)

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    providers: { yahoo: true, finnhub: finnhub.configured(), sec: sec.configured(), llm: llm.configured() },
    cacheEntries: cacheSize(),
    uptimeSec: Math.round(process.uptime()),
  })
})

app.use('/market', market)
app.use('/alerts', alerts)
app.use('/rewards', rewards)
app.use('/news', news)
app.use('/filings', filings)
app.use('/analytics', analytics)
app.use('/pons-chart', pons)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`MarketLens server listening on http://localhost:${PORT}`)
  console.log(`providers: yahoo=on finnhub=${finnhub.configured() ? 'on' : 'off'} sec=${sec.configured() ? 'on' : 'off'} llm=${llm.configured() ? 'on' : 'off'}`)
})
