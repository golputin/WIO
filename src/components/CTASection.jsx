import { ArrowRight, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, Section } from './ui.jsx'

export default function CTASection() {
  return (
    <Section id="cta" className="!pt-6 sm:!pt-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          {/* restrained backdrop: soft radial blue + faint grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 80% at 80% 10%, rgba(22,119,255,0.35), transparent 60%), radial-gradient(50% 60% at 10% 100%, rgba(22,119,255,0.18), transparent 60%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
            }}
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.08]">
              See the market differently.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Market intelligence and on-chain rewards, built into one platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/markets" className="btn-primary">
                Explore Markets <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/rewards"
                className="btn border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
              >
                <Gift className="size-4" strokeWidth={2} /> View Rewards
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
