import { env } from '../config/environment.js'
import { Reveal, Section } from './ui.jsx'
import XIcon from './XIcon.jsx'

/** Community — X is the only channel. No follower counts or other social proof. */
export default function CommunitySection() {
  return (
    <Section id="community" className="!py-10 sm:!py-14">
      <Reveal>
        <div className="card flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10 md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
              <XIcon className="size-5" />
            </span>
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-navy sm:text-2xl">Follow MarketLens on X</h2>
              <p className="mt-1 text-sm text-muted">Product updates, market notes and protocol announcements.</p>
            </div>
          </div>
          <a href={env.xUrl} target="_blank" rel="noreferrer noopener" className="btn-secondary shrink-0">
            <XIcon className="size-3.5" /> Follow on X
          </a>
        </div>
      </Reveal>
    </Section>
  )
}
