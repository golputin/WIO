import { Link } from 'react-router-dom'
import { env } from '../config/environment.js'
import { FOOTER_COLUMNS } from '../data/navigation.js'
import MarketLensLogo from './MarketLensLogo.jsx'
import XIcon from './XIcon.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <MarketLensLogo height={28} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Understand the Market. Earn the Market.</p>
            <a
              href={env.xUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-fg transition hover:border-gold/30 hover:bg-surface-2"
            >
              <XIcon className="size-3.5" /> Follow on X
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold tracking-wider text-fg uppercase">{col.heading}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      {l.external ? (
                        <a
                          href={l.to}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm text-muted transition hover:text-gold"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link to={l.to} className="text-sm text-muted transition hover:text-gold">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold tracking-wider text-fg uppercase">Community</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href={env.xUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-gold"
                  >
                    <XIcon className="size-3" /> X
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MarketLens. All rights reserved.</p>
          <p className="max-w-xl">MarketLens is a technology platform and does not provide financial advice.</p>
        </div>
      </div>
    </footer>
  )
}
