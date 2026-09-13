import AboutSection from '../components/AboutSection.jsx'
import CommunitySection from '../components/CommunitySection.jsx'
import CTASection from '../components/CTASection.jsx'
import DailyBriefSection from '../components/DailyBriefSection.jsx'
import FeaturesSection from '../components/FeaturesSection.jsx'
import FilingSection from '../components/FilingSection.jsx'
import Hero from '../components/Hero.jsx'
import MarketTicker from '../components/MarketTicker.jsx'
import RewardsSection from '../components/RewardsSection.jsx'
import TokenSection from '../components/TokenSection.jsx'
import WhyMovingSection from '../components/WhyMovingSection.jsx'

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarketTicker />
      <FeaturesSection />
      <WhyMovingSection />
      <FilingSection />
      <DailyBriefSection />
      <TokenSection />
      <RewardsSection />
      <AboutSection />
      <CommunitySection />
      <CTASection />
    </>
  )
}
