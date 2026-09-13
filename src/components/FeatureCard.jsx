import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FeatureCard({ icon: Icon, title, description, to }) {
  const Wrapper = to ? Link : 'div'
  return (
    <Wrapper to={to} className="card card-hover group flex h-full flex-col p-6 sm:p-7">
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-light text-blue transition-colors group-hover:bg-blue group-hover:text-white">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      {to && (
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue">
          Learn more <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </Wrapper>
  )
}
