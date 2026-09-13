import { useState } from 'react'
import { useMovers } from '../hooks/useMarketData.js'
import WhyMoving from './WhyMoving.jsx'
import { Reveal, Section, SectionHeader } from './ui.jsx'

/** Home-page section. Default asset = first live trending symbol; user can switch via search. */
export default function WhyMovingSection() {
  const trending = useMovers('trending')
  const [picked, setPicked] = useState(null)
  const symbol = picked ?? (trending.state === 'ok' ? trending.data?.[0]?.symbol ?? null : null)

  return (
    <Section id="why-moving" tone="tint">
      <Reveal>
        <SectionHeader
          eyebrow="Why is it moving?"
          title="Don't just watch the price. Understand it."
          subtitle="MarketLens connects price action to verified news, filings and market signals — and tells you when it can't."
        />
      </Reveal>
      <Reveal className="mt-12" delay={0.1}>
        <WhyMoving symbol={symbol} onChangeSymbol={setPicked} />
      </Reveal>
    </Section>
  )
}
