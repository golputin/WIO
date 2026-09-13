import { ArrowRight, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import RewardMechanism from './RewardMechanism.jsx'
import { Reveal, Section, SectionHeader } from './ui.jsx'

/**
 * Home teaser for stock rewards. Explains the mechanism only — balances live on /rewards
 * and are read from the contract, so nothing numeric is rendered here.
 */
export default function RewardsSection() {
  return (
    <Section id="rewards">
      <Reveal>
        <SectionHeader
          eyebrow="Stock rewards"
          title="Hold MarketLens. Earn the market."
          subtitle="Protocol fees are processed through the reward infrastructure and recorded as claimable, stock-linked rewards for eligible holders. Every step is verifiable on-chain."
        />
      </Reveal>

      <div className="mt-12">
        <RewardMechanism />
      </div>

      <Reveal className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" delay={0.15}>
        <Link to="/rewards" className="btn-primary">
          <Gift className="size-4" strokeWidth={2} /> View Rewards
        </Link>
        <Link to="/about" className="btn-ghost">
          How it works <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </Section>
  )
}
