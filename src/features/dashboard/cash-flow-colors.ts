/**
 * Semantic colours for cash-flow presentation on the dashboard.
 *
 * Kept as plain hex values plus literal Tailwind class strings rather than CSS
 * custom properties, because the dashboard charts are hand-rolled SVG and set
 * colour through presentation attributes (`stroke`, `stop-color`, `fill`), which
 * do not resolve `var()`. Keeping both in one place avoids the two drifting.
 *
 * Class strings must stay literal so Tailwind can scan them - never template these.
 */
export const cashFlowTone = {
  income: {
    hex: '#1A5C38',
    text: 'text-[#1A5C38]',
    softBg: 'bg-[#E8F5EE]',
    bar: 'bg-[#1A5C38]',
  },
  expense: {
    hex: '#8A6A1F',
    text: 'text-[#8A6A1F]',
    softBg: 'bg-[#F6F1E4]',
    bar: 'bg-[#8A6A1F]',
  },
  net: {
    hex: '#B42318',
    text: 'text-[#B42318]',
    softBg: 'bg-[#FDF0EE]',
    bar: 'bg-[#B42318]',
  },
} as const;

export type CashFlowToneKey = keyof typeof cashFlowTone;

/** Neutral chart furniture: axes, gridlines, tick labels, tooltip surface. */
export const chartNeutral = {
  gridline: '#E8E8E4',
  axis: '#DEDED9',
  tickLabel: '#8A8A82',
  crosshair: '#C9C9C2',
  tooltipSurface: '#1C1C1A',
  tooltipBorder: '#3A3A35',
  tooltipLabel: '#D6D6CE',
  tooltipValue: '#FFFFFF',
} as const;
