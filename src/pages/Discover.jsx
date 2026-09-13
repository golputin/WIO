import MarketDiscovery from '../components/MarketDiscovery.jsx'
import MarketTicker from '../components/MarketTicker.jsx'
import { Section, SectionHeader } from '../components/ui.jsx'

export default function DiscoverPage() {
  return (
    <>
      <Section className="!pb-6 sm:!pb-8">
        <SectionHeader
          align="left"
          eyebrow="Discover"
          title="What the market is paying attention to."
          subtitle="Trending assets, top movers, unusual volume, upcoming earnings, recent filings and scheduled events — all from live providers."
        />
      </Section>
      <MarketTicker />
      <div className="container-x py-10 lg:py-12">
        <MarketDiscovery />
      </div>
    </>
  )
}
