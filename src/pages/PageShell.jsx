import { Section, SectionHeader } from '../components/ui.jsx'

/** Common page header used by inner routes. */
export default function PageShell({ eyebrow, title, subtitle, children, aside }) {
  return (
    <>
      <Section className="!pb-8 sm:!pb-10 lg:!pb-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader as="h1" align="left" eyebrow={eyebrow} title={title} subtitle={subtitle} />
          {aside}
        </div>
      </Section>
      <div className="container-x pb-20">{children}</div>
    </>
  )
}
