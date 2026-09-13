import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MarketLensMark } from './MarketLensLogo.jsx'

export default function FeatureCard({ icon: Icon, title, description, to, featured = false }) {
  const Wrapper = to ? Link : 'div'
  return (
    <Wrapper to={to} className="card card-hover group relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
      {featured && (
        <MarketLensMark
          size={220}
          variant="mono"
          id={`fc-${title}`}
          className="pointer-events-none absolute -right-8 -bottom-12 text-gold opacity-[0.07] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"
        />
      )}
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-surface-2 text-gold transition-all duration-300 group-hover:-rotate-6 group-hover:bg-gold group-hover:text-ink">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      {to && (
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold">
          Open lens <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </Wrapper>
  )
}
