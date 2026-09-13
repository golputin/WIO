/** Static product navigation — copy only, no market data. */

export const NAV_LINKS = [
  { label: 'Home', to: '/', end: true },
  { label: 'Markets', to: '/markets' },
  { label: 'News', to: '/news' },
  { label: 'Filings', to: '/filings' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Rewards', to: '/rewards' },
]

export const FOOTER_COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Markets', to: '/markets' },
      { label: 'News', to: '/news' },
      { label: 'Filings', to: '/filings' },
      { label: 'Analytics', to: '/analytics' },
      { label: 'Rewards', to: '/rewards' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { label: 'Watchlist', to: '/watchlist' },
      { label: 'Discover', to: '/discover' },
      { label: 'Alerts', to: '/alerts' },
      { label: 'About', to: '/about' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', to: 'https://github.com/golputin/WIO/tree/main/docs', external: true },
      { label: 'Rewards (read-only) spec', to: 'https://github.com/golputin/WIO/blob/main/docs/REWARDS_READ_ONLY.md', external: true },
    ],
  },
]

export const BRAND = Object.freeze({
  name: 'MarketLens Capital',
  tagline: 'Markets. Clarity. Opportunity.',
  positioning: 'Real Data. Deeper Intelligence.',
})
