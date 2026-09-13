import FeaturesSection from '../components/FeaturesSection.jsx'
import Hero from '../components/Hero.jsx'
import MarketTicker from '../components/MarketTicker.jsx'
import WhyMovingSection from '../components/WhyMovingSection.jsx'

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarketTicker />
      <FeaturesSection />
      <WhyMovingSection />
    </>
  )
}
