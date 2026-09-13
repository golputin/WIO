import { Eye, Layers, ShieldCheck } from 'lucide-react'
import { Reveal, Section, SectionHeader } from './ui.jsx'

const PRINCIPLES = [
  { icon: Eye, title: 'Clear', text: 'Complex market information presented simply.' },
  { icon: Layers, title: 'Intelligent', text: 'AI connects relevant information across markets, news and filings.' },
  { icon: ShieldCheck, title: 'Transparent', text: 'Reward mechanics and on-chain activity can be independently verified.' },
]

/** Three product principles. Reused on Home and the About page. */
export function PrincipleGrid({ className = '' }) {
  return (
    <div className={`grid gap-5 md:grid-cols-3 ${className}`}>
      {PRINCIPLES.map((p, i) => {
        const Icon = p.icon
        return (
          <Reveal key={p.title} delay={i * 0.07}>
            <div className="card card-hover h-full p-6 sm:p-7">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-light text-blue">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function AboutSection() {
  return (
    <Section id="about" tone="tint">
      <Reveal>
        <SectionHeader eyebrow="About MarketLens" title="Built for clarity. Designed for better market awareness." />
      </Reveal>
      <PrincipleGrid className="mt-12" />
    </Section>
  )
}
