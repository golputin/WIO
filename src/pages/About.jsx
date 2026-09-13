import { Activity, Bell, FileText, Gift, ShieldCheck } from 'lucide-react'
import { PrincipleGrid } from '../components/AboutSection.jsx'
import CommunitySection from '../components/CommunitySection.jsx'
import CTASection from '../components/CTASection.jsx'
import RewardMechanism from '../components/RewardMechanism.jsx'
import { Reveal, Section, SectionHeader } from '../components/ui.jsx'
import PageShell from './PageShell.jsx'

const CAPABILITIES = [
  { icon: Activity, title: 'Real-time market intelligence', text: 'Quotes, indices, movers and events sourced from configured live providers.' },
  { icon: FileText, title: 'SEC & filing intelligence', text: 'What changed, key developments and risks — generated only from actual filing content, with sources.' },
  { icon: Bell, title: 'Smart alerts', text: 'Price, volume, filing, earnings and news conditions delivered through the alert backend.' },
  { icon: Gift, title: 'Stock rewards', text: 'Protocol fees become claimable, stock-linked rewards for eligible holders. Balances are read from the contract.' },
]

export default function AboutPage() {
  return (
    <>
      <PageShell
        eyebrow="About MarketLens"
        title="Built for clarity. Designed for better market awareness."
        subtitle="MarketLens turns market data, news and company filings into clear intelligence — and gives eligible holders a transparent, verifiable path to stock-linked rewards."
      >
        <PrincipleGrid />

        <Reveal className="mt-16" delay={0.05}>
          <SectionHeader align="left" eyebrow="What the platform does" title="Intelligence first. Rewards second." />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {CAPABILITIES.map((c, i) => {
            const Icon = c.icon
            return (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className="card flex h-full gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-light text-blue">
                    <Icon className="size-4.5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-navy">{c.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.text}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-10" delay={0.1}>
          <div className="card flex gap-4 border-blue-100 bg-light/60 p-6">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue" strokeWidth={1.75} />
            <div className="text-sm">
              <p className="font-semibold text-navy">Our data principle</p>
              <p className="mt-1 leading-relaxed text-muted">
                MarketLens never displays fabricated market, reward or protocol figures. If a data source is not connected or a
                catalyst cannot be verified, the interface says so. AI explanations are generated only from retrieved sources and
                always cite them.
              </p>
            </div>
          </div>
        </Reveal>
      </PageShell>

      <Section id="mechanism" tone="tint">
        <Reveal>
          <SectionHeader
            eyebrow="How rewards work"
            title="From protocol fees to claimable rewards."
            subtitle="A transparent, verifiable path — no guesswork about where rewards come from."
          />
        </Reveal>
        <div className="mt-12">
          <RewardMechanism />
        </div>
      </Section>

      <CommunitySection />
      <CTASection />
    </>
  )
}
