import { motion } from 'framer-motion'
import { ArrowRight, Brain, Link2, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import MarketDashboard from './MarketDashboard.jsx'

const HIGHLIGHTS = [
  { icon: Radio, label: 'Live market data' },
  { icon: Brain, label: 'AI market intelligence' },
  { icon: Link2, label: 'On-chain rewards' },
]

const ease = [0.22, 1, 0.36, 1]

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Restrained backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[640px] grid-fade" />
        <div className="absolute top-[-160px] right-[-120px] size-[560px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-[200px] left-[-200px] size-[420px] rounded-full bg-surface-2 blur-3xl opacity-80" />
      </div>

      <div className="container-x grid items-center gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-24">
        <div className="lg:col-span-6">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            Markets. Clarity. Opportunity.
          </motion.p>

          <motion.h1
            className="mt-5 text-[2.6rem] leading-[1.05] font-bold tracking-tight text-fg sm:text-6xl lg:text-[4.25rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
          >
            See the Market
            <br />
            <span className="text-gradient-gold">Different.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
          >
            Real-time market data, deeper intelligence, and on-chain opportunities — through a smarter lens.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
          >
            <Link to="/markets" className="btn-primary !px-6 !py-3 text-base">
              Explore Markets <ArrowRight className="size-4" />
            </Link>
            <Link to="/analytics" className="btn-secondary !px-6 !py-3 text-base">
              Why is it moving?
            </Link>
          </motion.div>

          <motion.ul
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2 text-sm font-medium text-fg-2">
                <span className="inline-flex size-6 items-center justify-center rounded-md bg-surface-2 text-gold">
                  <Icon className="size-3.5" />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div className="mx-auto max-w-md lg:ml-auto lg:max-w-none">
            <MarketDashboard />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
