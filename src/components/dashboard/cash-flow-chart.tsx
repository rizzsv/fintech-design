'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/format';
import { cashFlowTone, chartNeutral } from '@/features/dashboard/cash-flow-colors';
import type { CashFlowSeriesItem } from '@/features/dashboard/types';

interface CashFlowChartProps {
  series: CashFlowSeriesItem[];
}

interface Point {
  x: number;
  y: number;
}

const SVG_WIDTH = 440;
const SVG_HEIGHT = 300;
const PADDING = { top: 20, right: 16, bottom: 36, left: 64 };
const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;
const PLOT_BOTTOM = PADDING.top + PLOT_HEIGHT;
const GRID_COUNT = 5;

const TOOLTIP_WIDTH = 160;
const TOOLTIP_HEIGHT = 86;

/**
 * Steps that still read as round numbers once the `rb`/`jt` suffix is applied.
 * A coarser ladder rounds too far up and leaves the peak of the series sitting
 * halfway up the plot.
 */
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/**
 * Axis labels are only readable when they land on round numbers, so the top of
 * the scale is raised to the next round step. Scaling the maximum by a fixed
 * factor instead produced labels such as "Rp 1.3jt".
 */
function niceAxisMax(maxValue: number): number {
  const roughStep = maxValue / GRID_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const step = (NICE_STEPS.find((candidate) => candidate >= normalized) ?? 10) * magnitude;

  return Math.max(1, step) * GRID_COUNT;
}

/**
 * Trims trailing zeros and float residue so a round step renders as "Rp 1jt"
 * rather than "Rp 1.0jt", without rounding 1.25 away to an inaccurate "1.3".
 */
function compactNumber(value: number): number {
  return parseFloat(value.toFixed(2));
}

function formatYAxisLabel(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${compactNumber(value / 1_000_000)}jt`;
  }

  if (value >= 1_000) {
    return `Rp ${compactNumber(value / 1_000)}rb`;
  }

  return `Rp ${compactNumber(value)}`;
}

function formatAxisDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}

// Keep the date row legible: a 30 day range cannot carry 30 labels at this width.
function getLabelInterval(seriesLength: number): number {
  if (seriesLength <= 8) return 1;
  if (seriesLength <= 14) return 2;
  if (seriesLength <= 30) return 3;

  return Math.ceil(seriesLength / 10);
}

/**
 * Catmull-Rom control points give a curve that passes through every value with
 * symmetric tangents on both sides of it. A single quadratic control point per
 * segment bends each segment towards its start instead, which leaves a visible
 * kink at every data point.
 */
const SPLINE_TENSION = 0.5;

function buildSplinePath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  // Amounts are never negative, so no control point may pull the curve below
  // the zero baseline or above the top of the scale.
  const clampY = (y: number) => Math.min(Math.max(y, PADDING.top), PLOT_BOTTOM);

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const previous = points[i - 1] ?? points[i];
    const start = points[i];
    const end = points[i + 1];
    const next = points[i + 2] ?? end;

    const firstControlX = start.x + ((end.x - previous.x) / 6) * SPLINE_TENSION;
    const firstControlY = clampY(start.y + ((end.y - previous.y) / 6) * SPLINE_TENSION);
    const secondControlX = end.x - ((next.x - start.x) / 6) * SPLINE_TENSION;
    const secondControlY = clampY(end.y - ((next.y - start.y) / 6) * SPLINE_TENSION);

    path += ` C ${firstControlX} ${firstControlY} ${secondControlX} ${secondControlY} ${end.x} ${end.y}`;
  }

  return path;
}

export function CashFlowChart({ series }: CashFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!series || series.length === 0) {
      return null;
    }

    const incomeValues = series.map((item) => parseFloat(item.income) || 0);
    const expenseValues = series.map((item) => parseFloat(item.expense) || 0);

    let maxValue = Math.max(...incomeValues, ...expenseValues);

    // A period with no movement still needs a scale to draw the baseline on.
    if (maxValue === 0 || !isFinite(maxValue)) {
      maxValue = 1;
    }

    const axisMax = niceAxisMax(maxValue);
    const yScale = PLOT_HEIGHT / axisMax;
    const xScale = PLOT_WIDTH / (series.length - 1 || 1);

    const toPoints = (values: number[]): Point[] =>
      values.map((value, index) => ({
        x: PADDING.left + index * xScale,
        y: PLOT_BOTTOM - value * yScale,
      }));

    const incomePoints = toPoints(incomeValues);
    const expensePoints = toPoints(expenseValues);
    const incomePath = buildSplinePath(incomePoints);

    return {
      axisMax,
      xScale,
      incomePoints,
      expensePoints,
      incomePath,
      expensePath: buildSplinePath(expensePoints),
      incomeAreaPath: incomePath
        ? `${incomePath} L ${incomePoints[incomePoints.length - 1].x} ${PLOT_BOTTOM} L ${incomePoints[0].x} ${PLOT_BOTTOM} Z`
        : '',
    };
  }, [series]);

  if (!chartData) {
    return null;
  }

  const { axisMax, xScale, incomePoints, expensePoints } = chartData;

  /**
   * The card keeps the tooltip inside the plot so it is never clipped by the
   * SVG edge, and drops below the point when there is no room above it.
   */
  const getTooltipPosition = (xCoord: number, yCoord: number) => {
    const edge = 10;
    const minX = PADDING.left + edge;
    const maxX = SVG_WIDTH - PADDING.right - edge - TOOLTIP_WIDTH;

    const x = Math.min(Math.max(xCoord - TOOLTIP_WIDTH / 2, minX), Math.max(minX, maxX));
    const above = yCoord - TOOLTIP_HEIGHT - 10;
    const y = above < PADDING.top + edge ? yCoord + 15 : above;

    return { x, y };
  };

  const labelInterval = getLabelInterval(series.length);
  const hovered = hoveredIndex === null ? null : series[hoveredIndex];
  const tooltipPosition =
    hoveredIndex === null
      ? null
      : getTooltipPosition(
          PADDING.left + hoveredIndex * xScale,
          Math.min(incomePoints[hoveredIndex].y, expensePoints[hoveredIndex].y)
        );

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="block"
          role="img"
          aria-label="Daily income and expense for the selected period"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cashFlowTone.income.hex} stopOpacity="0.18" />
              <stop offset="100%" stopColor={cashFlowTone.income.hex} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines only, dashed, with no axis rules of their own */}
          {Array.from({ length: GRID_COUNT + 1 }, (_, index) => {
            const y = PADDING.top + (PLOT_HEIGHT / GRID_COUNT) * index;

            return (
              <line
                key={`grid-${index}`}
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke={chartNeutral.gridline}
                strokeWidth="1"
                strokeDasharray="3,4"
              />
            );
          })}

          {Array.from({ length: GRID_COUNT + 1 }, (_, index) => {
            const y = PADDING.top + (PLOT_HEIGHT / GRID_COUNT) * index;
            const value = axisMax - (axisMax / GRID_COUNT) * index;

            return (
              <text
                key={`y-label-${index}`}
                x={PADDING.left - 12}
                y={y + 3}
                fontSize="10"
                fill={chartNeutral.tickLabel}
                textAnchor="end"
              >
                {formatYAxisLabel(value)}
              </text>
            );
          })}

          {series.map((item, index) =>
            index % labelInterval === 0 ? (
              <text
                key={`x-label-${item.date}`}
                x={PADDING.left + index * xScale}
                y={PLOT_BOTTOM + 18}
                fontSize="10"
                fill={chartNeutral.tickLabel}
                textAnchor="middle"
              >
                {formatAxisDate(item.date)}
              </text>
            ) : null
          )}

          {hoveredIndex !== null && (
            <line
              x1={PADDING.left + hoveredIndex * xScale}
              y1={PADDING.top}
              x2={PADDING.left + hoveredIndex * xScale}
              y2={PLOT_BOTTOM}
              stroke={chartNeutral.crosshair}
              strokeWidth="1"
              strokeDasharray="4"
            />
          )}

          {chartData.incomeAreaPath && (
            <path d={chartData.incomeAreaPath} fill="url(#incomeGradient)" />
          )}

          <path
            d={chartData.incomePath}
            stroke={cashFlowTone.income.hex}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={chartData.expensePath}
            stroke={cashFlowTone.expense.hex}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/*
            A marker per day would put one dot every few pixels across a month,
            so only the hovered day is marked.
          */}
          {hoveredIndex !== null && (
            <>
              <circle
                cx={incomePoints[hoveredIndex].x}
                cy={incomePoints[hoveredIndex].y}
                r="4"
                fill="#ffffff"
                stroke={cashFlowTone.income.hex}
                strokeWidth="2"
              />
              <circle
                cx={expensePoints[hoveredIndex].x}
                cy={expensePoints[hoveredIndex].y}
                r="4"
                fill="#ffffff"
                stroke={cashFlowTone.expense.hex}
                strokeWidth="2"
              />
            </>
          )}

          {/*
            Hit areas span the full plot height so the pointer only has to be in
            the right column, rather than on top of a 4px marker.
          */}
          {series.map((item, index) => {
            const center = PADDING.left + index * xScale;
            const left = Math.max(PADDING.left, center - xScale / 2);
            const right = Math.min(SVG_WIDTH - PADDING.right, center + xScale / 2);

            return (
              <rect
                key={`hit-${item.date}`}
                x={left}
                y={PADDING.top}
                width={right - left}
                height={PLOT_HEIGHT}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            );
          })}

          {hovered && tooltipPosition && (
            <g
              className="pointer-events-none"
              transform={`translate(${tooltipPosition.x}, ${tooltipPosition.y})`}
            >
              <rect
                x="0"
                y="0"
                width={TOOLTIP_WIDTH}
                height={TOOLTIP_HEIGHT}
                rx="8"
                fill={chartNeutral.tooltipSurface}
                stroke={chartNeutral.tooltipBorder}
                strokeWidth="1"
                opacity="0.97"
              />
              <text x="12" y="19" fontSize="11" fill={chartNeutral.tooltipLabel} fontWeight="600">
                {formatAxisDate(hovered.date)}
              </text>
              <circle cx="14" cy="36" r="3.5" fill={cashFlowTone.income.hex} />
              <text x="24" y="40" fontSize="10" fill={chartNeutral.tooltipLabel}>
                Income
              </text>
              <text
                x="148"
                y="40"
                textAnchor="end"
                fontSize="10"
                fill={chartNeutral.tooltipValue}
                fontWeight="600"
              >
                {formatCurrency(hovered.income)}
              </text>
              <circle cx="14" cy="54" r="3.5" fill={cashFlowTone.expense.hex} />
              <text x="24" y="58" fontSize="10" fill={chartNeutral.tooltipLabel}>
                Expense
              </text>
              <text
                x="148"
                y="58"
                textAnchor="end"
                fontSize="10"
                fill={chartNeutral.tooltipValue}
                fontWeight="600"
              >
                {formatCurrency(hovered.expense)}
              </text>
              <circle cx="14" cy="72" r="3.5" fill={cashFlowTone.net.hex} />
              <text x="24" y="76" fontSize="10" fill={chartNeutral.tooltipLabel}>
                Net
              </text>
              <text
                x="148"
                y="76"
                textAnchor="end"
                fontSize="10"
                fill={chartNeutral.tooltipValue}
                fontWeight="600"
              >
                {formatCurrency(hovered.net)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Ring swatch on the series' own line style: the ring matches the hover
          marker and the dash keeps income and expense distinguishable. */}
      <div className="flex shrink-0 justify-center gap-6 py-1 text-xs">
        <div className="flex items-center gap-2">
          <svg width="26" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="26" y2="5" stroke={cashFlowTone.income.hex} strokeWidth="2.5" />
            <circle
              cx="13"
              cy="5"
              r="3.5"
              fill="#ffffff"
              stroke={cashFlowTone.income.hex}
              strokeWidth="2"
            />
          </svg>
          <span className="text-[#6B7280]">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="26" height="10" aria-hidden="true">
            <line
              x1="0"
              y1="5"
              x2="26"
              y2="5"
              stroke={cashFlowTone.expense.hex}
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <circle
              cx="13"
              cy="5"
              r="3.5"
              fill="#ffffff"
              stroke={cashFlowTone.expense.hex}
              strokeWidth="2"
            />
          </svg>
          <span className="text-[#6B7280]">Expense</span>
        </div>
      </div>
    </div>
  );
}
