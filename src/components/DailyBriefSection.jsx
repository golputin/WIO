import DailyBrief from './DailyBrief.jsx'
import { Reveal, Section, SectionHeader } from './ui.jsx'

export default function DailyBriefSection() {
  return (
    <Section id="daily" tone="tint">
      <Reveal>
        <SectionHeader eyebrow="MarketLens Daily" title="Your market, briefed." subtitle="A daily read on what moved and what matters — built only from live market and news data." />
      </Reveal>
      <Reveal className="mt-12" delay={0.1}>
        <DailyBrief />
      </Reveal>
    </Section>
  )
}
