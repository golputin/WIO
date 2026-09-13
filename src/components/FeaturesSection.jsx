import { Activity, Bell, Brain, FileText, Gift, Newspaper, Radio } from 'lucide-react'
import FeatureCard from './FeatureCard.jsx'
import { Reveal, Section, SectionHeader } from './ui.jsx'

const FEATURES = [
  { icon: Radio, title: 'Live Market Data', description: 'Quotes, charts, indices and movers streamed from connected providers — never a placeholder number.', to: '/markets' },
  { icon: Activity, title: 'Why Is It Moving?', description: 'Catalysts detected only from retrieved headlines, filings and the live tape. If nothing is verified, we say so.', to: '/analytics' },
  { icon: Newspaper, title: 'News', description: 'Verified headlines with every story linked to its original publisher, filterable by asset.', to: '/news' },
  { icon: FileText, title: 'SEC Filings', description: 'Primary documents read end-to-end; the metrics, developments and risks that moved, with sources.', to: '/filings' },
  { icon: Brain, title: 'AI Market Intelligence', description: 'Summaries and sentiment generated server-side from real documents and data — cited, never invented.', to: '/analytics' },
  { icon: Bell, title: 'Smart Alerts', description: 'Price levels, unusual volume, new filings and earnings — delivered as web notifications.', to: '/alerts' },
  { icon: Gift, title: 'On-Chain Rewards', description: 'Read-only view of protocol reward balances and history, straight from the connected contracts.', to: '/rewards' },
]

export default function FeaturesSection() {
  return (
    <Section id="features">
      <Reveal>
        <SectionHeader
          eyebrow="Platform"
          title="Everything you need to see the market clearly."
          subtitle="Seven lenses on one screen — each one wired to live data, each one honest about what it can and cannot see."
        />
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:*:first:col-span-2">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <FeatureCard {...f} featured={i === 0} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
