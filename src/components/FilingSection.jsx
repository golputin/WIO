import { useState } from 'react'
import { useRecentFilings } from '../hooks/useMarketData.js'
import FilingIntelligence from './FilingIntelligence.jsx'
import { Reveal, Section, SectionHeader } from './ui.jsx'

/** Home-page section. Default company = most recent filing from the provider; user can switch. */
export default function FilingSection() {
  const recent = useRecentFilings({ limit: 1 })
  const [picked, setPicked] = useState(null)
  const symbol = picked ?? (recent.state === 'ok' ? recent.data?.[0]?.symbol ?? null : null)

  return (
    <Section id="filings">
      <Reveal>
        <SectionHeader
          eyebrow="SEC & filing intelligence"
          title="Complex filings, distilled into what changed."
          subtitle="MarketLens reads the primary document and surfaces the metrics, developments and risks that moved — with sources attached."
        />
      </Reveal>
      <Reveal className="mt-12" delay={0.1}>
        <FilingIntelligence symbol={symbol} onChangeSymbol={setPicked} />
      </Reveal>
    </Section>
  )
}
