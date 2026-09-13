/** Brand mark geometry + tones. Plain JS so scripts/brand.mjs and the React mark share one source. */

export const LOGO_GEOMETRY = Object.freeze({
  viewBox: '0 0 64 64',
  left: { cx: 19, cy: 37, r: 12.5 },
  right: { cx: 45, cy: 37, r: 12.5 },
  bridge: 'M31.2 34.2C31.6 31.2 32.4 31.2 32.8 34.2',
  templeL: 'M6.6 35.2L2.5 30.5',
  templeR: 'M57.4 35.2L61.5 30.5',
  /** Candles: [x, wickTop, wickBottom, bodyTop, bodyBottom, up] */
  leftCandles: [
    [13.5, 39, 45, 40.5, 44, false],
    [19, 31.5, 41, 33.5, 39.5, true],
    [24.5, 28, 37, 30, 34.5, true],
  ],
  rightCandles: [
    [39.5, 29, 39, 31, 36.5, true],
    [45, 33, 44, 35, 41.5, false],
    [50.5, 31.5, 41, 33, 38.5, true],
  ],
})

export const LOGO_TONES = Object.freeze({
  dark: { frame: '#C9A961', glass: '#0E1626', glassEdge: 'rgba(201,169,97,0.18)', up: '#E3CB8C', down: 'rgba(244,246,250,0.55)', word: '#F4F6FA', sub: '#C9A961' },
  light: { frame: '#9B7E3E', glass: '#0E1626', glassEdge: 'rgba(155,126,62,0.25)', up: '#E3CB8C', down: 'rgba(244,246,250,0.55)', word: '#0B0F17', sub: '#9B7E3E' },
  mono: { frame: 'currentColor', glass: 'transparent', glassEdge: 'transparent', up: 'currentColor', down: 'currentColor', word: 'currentColor', sub: 'currentColor' },
})
