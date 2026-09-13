import { ArrowUpRight, Gift, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { token, tokenChartUrl, tokenPageUrl } from '../config/token.js'
import ContractAddressButton from './ContractAddressButton.jsx'
import { MarketLensMark } from './MarketLensLogo.jsx'
import { Badge, Reveal, Section } from './ui.jsx'

const CHAIN_LABELS = { solana: 'Solana', ethereum: 'Ethereum', base: 'Base', bsc: 'BNB Chain', arbitrum: 'Arbitrum' }

/** Chart panel: live DexScreener embed when configured, otherwise an honest pre-launch state. */
function TokenChart() {
  const src = tokenChartUrl()
  if (src) {
    return (
      <iframe
        src={src}
        title={`${token.symbol} price chart`}
        className="size-full"
        loading="lazy"
        allow="clipboard-write"
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <div className="relative flex size-full flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden="true"
      />
      <MarketLensMark size={56} variant="light" className="animate-lens relative" id="tok" />
      <div className="relative">
        <p className="text-sm font-semibold text-white">Chart goes live at launch</p>
        <p className="mt-1 text-xs text-white/60">The official {token.symbol} chart appears here the moment the contract is published.</p>
      </div>
    </div>
  )
}

/**
 * Official MarketLens token: chart + contract address.
 * Everything is driven by VITE_TOKEN_*; before launch no chart, no address and no numbers are shown.
 */
export default function TokenSection() {
  const page = tokenPageUrl()
  const chain = token.chain ? (CHAIN_LABELS[token.chain] ?? token.chain) : null

  return (
    <Section id="token" tone="tint">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">Official token</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            One token. <span className="text-gold">Every lens.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {token.symbol} powers MarketLens: holders are eligible for stock-linked rewards processed through the protocol, verifiable on-chain.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="blue" dot>
              {token.symbol}
            </Badge>
            {chain && <Badge tone="muted">{chain}</Badge>}
            <Badge tone={token.live ? 'green' : 'muted'} dot>
              {token.live ? 'Contract published' : 'Pre-launch'}
            </Badge>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ContractAddressButton size="md" />
            {page ? (
              <a href={page} target="_blank" rel="noreferrer noopener" className="btn-secondary">
                Open on DexScreener <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <Link to="/rewards" className="btn-secondary">
                <Gift className="size-4" /> How rewards work
              </Link>
            )}
          </div>

          <p className="mt-5 inline-flex items-start gap-2 text-xs leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" />
            Only trust the contract address shown here and on the official X account. Anything else is not MarketLens.
          </p>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gold/10 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-2xl ring-1 ring-black/40">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <MarketLensMark size={18} variant="light" id="tok-h" />
                  <span className="text-xs font-semibold tracking-wide text-white">{token.symbol} / USD</span>
                </div>
                <span className="text-[11px] text-white/50">{token.live ? 'Live · DexScreener' : 'Awaiting launch'}</span>
              </div>
              <div className="aspect-[16/10] w-full text-white sm:aspect-[16/9]">
                <TokenChart />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
