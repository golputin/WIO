import { Gift, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { token, tokenChartApiUrl } from '../config/token.js'
import ContractAddressButton from './ContractAddressButton.jsx'
import { MarketLensMark } from './MarketLensLogo.jsx'
import { Badge, Reveal, Section } from './ui.jsx'

const CHAIN_LABELS = { robinhood: 'Robinhood Chain', solana: 'Solana', ethereum: 'Ethereum', base: 'Base', bsc: 'BNB Chain', arbitrum: 'Arbitrum' }

function TokenChart() {
  const [state, setState] = useState('loading')
  const [points, setPoints] = useState([])
  // WSEX/PONS may have sparse trades; 6h is the default live window while preserving real points only.
  const url = tokenChartApiUrl('6h')

  useEffect(() => {
    if (!url) { setState('idle'); return undefined }
    let cancelled = false
    let firstLoad = true
    const refresh = async () => {
      try {
        if (firstLoad) setState('loading')
        const response = await fetch(`${url}&_=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Pons chart HTTP ${response.status}`)
        const payload = await response.json()
        if (cancelled) return
        const next = Array.isArray(payload?.points) ? payload.points : []
        setPoints(next)
        setState(next.length ? 'ok' : 'empty')
        firstLoad = false
      } catch (cause) {
        if (!cancelled && cause.name !== 'AbortError') setState('unavailable')
      }
    }
    refresh()
    const timer = window.setInterval(refresh, 15_000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [url])

  const path = useMemo(() => {
    if (points.length < 2) return ''
    const values = points.map((point) => Number(point.priceUsd ?? point.price ?? point.c)).filter(Number.isFinite)
    if (values.length < 2) return ''
    const min = Math.min(...values); const span = Math.max(...values) - min || 1
    return values.map((value, index) => `${(index / (values.length - 1)) * 100},${92 - ((value - min) / span) * 78}`).join(' ')
  }, [points])

  if (state === 'ok' && path) return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full bg-navy p-6" role="img" aria-label={`${token.symbol} live Pons chart`}><polyline points={path} fill="none" stroke="#eab308" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
  const message = state === 'loading' ? 'Loading live Pons chart…' : state === 'unavailable' ? 'Pons chart unavailable' : state === 'empty' ? 'No Pons chart data for this token yet' : 'Chart goes live at launch'
  return <div className="relative flex size-full flex-col items-center justify-center gap-3 overflow-hidden px-6 text-center"><MarketLensMark size={48} variant="light" id="tok" /><p className="text-sm font-semibold text-white">{message}</p></div>
}

export default function TokenSection() {
  const chain = token.chain ? (CHAIN_LABELS[token.chain] ?? token.chain) : null
  return <Section id="token" tone="tint"><div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14"><Reveal className="lg:col-span-5"><p className="eyebrow">Official token</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">One token. <span className="text-gold">Every lens.</span></h2><p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{token.symbol} powers MarketLens: holders are eligible for stock-linked rewards processed through the protocol, verifiable on-chain.</p><div className="mt-6 flex flex-wrap items-center gap-2"><Badge tone="blue" dot>{token.symbol}</Badge>{chain && <Badge tone="muted">{chain}</Badge>}<Badge tone={token.live ? 'green' : 'muted'} dot>{token.live ? 'Contract published' : 'Pre-launch'}</Badge></div><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"><ContractAddressButton size="md" /><Link to="/rewards" className="btn-secondary"><Gift className="size-4" /> How rewards work</Link></div><p className="mt-5 inline-flex items-start gap-2 text-xs leading-relaxed text-muted"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" />Only trust the contract address shown here and on the official X account. Anything else is not MarketLens.</p></Reveal><Reveal className="lg:col-span-7" delay={0.1}><div className="relative"><div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gold/10 blur-2xl" aria-hidden="true" /><div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-2xl ring-1 ring-black/40"><div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5"><div className="flex items-center gap-2.5"><MarketLensMark size={18} variant="light" id="tok-h" /><span className="text-xs font-semibold tracking-wide text-white">{token.symbol} / USD</span></div><span className="text-[11px] text-white/50">{token.live ? 'Live · Pons API' : 'Awaiting launch'}</span></div><div className="aspect-[16/10] w-full text-white sm:aspect-[16/9]"><TokenChart /></div></div></div></Reveal></div></Section>
}
