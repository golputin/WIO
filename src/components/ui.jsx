import { motion, useReducedMotion } from 'framer-motion'
import { changeTone, formatPercent } from '../utils/formatters.js'

/** Section wrapper with consistent vertical rhythm. */
export function Section({ id, className = '', children, tone = 'default' }) {
  const bg = tone === 'tint' ? 'bg-white' : ''
  return (
    <section id={id} className={`relative py-16 sm:py-20 lg:py-24 ${bg} ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  )
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', className = '', as: Heading = 'h2' }) {
  const alignCls = align === 'center' ? 'mx-auto text-center' : ''
  return (
    <div className={`max-w-2xl ${alignCls} ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </Heading>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </div>
  )
}

/** Fade-up reveal on scroll. */
export function Reveal({ children, delay = 0, className = '', y = 20, once = true }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  const tones = {
    neutral: 'bg-light text-navy',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-[#0f8a5f]',
    red: 'bg-red-100 text-red',
    muted: 'bg-bg text-muted border border-border',
  }
  const dots = { neutral: 'bg-navy', blue: 'bg-blue', green: 'bg-green', red: 'bg-red', muted: 'bg-muted' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {dot && <span className={`size-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  )
}

/** Render a percentage change with semantic colour. Renders nothing when value is missing. */
export function ChangeText({ value, className = '' }) {
  const text = formatPercent(value)
  if (text === null) return null
  const tone = changeTone(value)
  const cls = tone === 'positive' ? 'text-green' : tone === 'negative' ? 'text-red' : 'text-muted'
  return <span className={`tabular font-semibold ${cls} ${className}`}>{text}</span>
}

export function Divider({ className = '' }) {
  return <hr className={`border-border ${className}`} />
}

export function SourceList({ sources = [] }) {
  if (!Array.isArray(sources) || sources.length === 0) return null
  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">Sources</p>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {sources.map((s, i) => (
          <li key={`${s.label}-${i}`}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-blue hover:underline">
                {s.label}
              </a>
            ) : (
              <span className="text-muted">{s.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
