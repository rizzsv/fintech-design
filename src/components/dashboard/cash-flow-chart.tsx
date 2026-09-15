'use client';

import React, { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/format';
import type { CashFlowSeriesItem } from '@/features/dashboard/types';

interface CashFlowChartProps {
  series: CashFlowSeriesItem[];
}

// Format Y-axis label compactly
function formatYAxisLabel(value: number): string {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
}

// Get responsive label interval based on data length (no window.innerWidth)
function getLabelInterval(seriesLength: number): number {
  if (seriesLength <= 8) return 1; // Show all
  if (seriesLength <= 14) return 2; // Every 2nd
  if (seriesLength <= 30) return 3; // Every 3rd
  return Math.ceil(seriesLength / 10); // ~10 labels max
}

export function CashFlowChart({ series }: CashFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!series || series.length === 0) {
      return null;
    }

    // Parse all values for calculation
    const incomeValues = series.map((item) => parseFloat(item.income) || 0);
    const expenseValues = series.map((item) => parseFloat(item.expense) || 0);

    // Get actual maximum (no percentile, keep all data visible)
    let maxValue = Math.max(...incomeValues, ...expenseValues);

    // Handle edge case: all zeros
    if (maxValue === 0 || !isFinite(maxValue)) {
      maxValue = 1;
    }

    // Add 15% padding to top for visual breathing room
    const paddedMaxValue = maxValue * 1.15;

    return {
      incomeValues,
      expenseValues,
      maxValue,
      paddedMaxValue,
      length: series.length,
    };
  }, [series]);

  if (!chartData) {
    return null;
  }

  // SVG constants
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 300;
  const PADDING = { top: 20, right: 28, bottom: 40, left: 72 };
  const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
  const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // Calculate scales
  const yScale = PLOT_HEIGHT / (chartData.paddedMaxValue || 1);
  const xScale = PLOT_WIDTH / (chartData.length - 1 || 1);

  // Generate smooth Bezier path
  const generateBezierPath = (values: number[]): string => {
    if (values.length === 0) return '';

    const points = values.map((value, i) => ({
      x: PADDING.left + i * xScale,
      y: PADDING.top + PLOT_HEIGHT - value * yScale,
    }));

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y + (curr.y - prev.y) * 0.2;

      path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
    }

    return path;
  };

  // Generate area path for fill
  const generateAreaPath = (values: number[]): string => {
    if (values.length === 0) return '';

    const pointsPath = generateBezierPath(values);
    const lastPoint = {
      x: PADDING.left + (values.length - 1) * xScale,
      y: PADDING.top + PLOT_HEIGHT,
    };
    const firstPoint = {
      x: PADDING.left,
      y: PADDING.top + PLOT_HEIGHT,
    };

    return `${pointsPath} L ${lastPoint.x} ${lastPoint.y} L ${firstPoint.x} ${firstPoint.y} Z`;
  };

  const incomePath = generateBezierPath(chartData.incomeValues);
  const expensePath = generateBezierPath(chartData.expenseValues);
  const incomeAreaPath = generateAreaPath(chartData.incomeValues);

  // Smart tooltip positioning with boundary detection (kept for future re-enabling)
  const getTooltipPosition = (xCoord: number, yCoord: number) => {
    const tooltipWidth = 160;
    const tooltipHeight = 75;
    const PADDING_EDGE = 10;

    let tooltipX = xCoord - tooltipWidth / 2;
    let tooltipY = yCoord - tooltipHeight - 10;

    if (tooltipX < PADDING.left + PADDING_EDGE) {
      tooltipX = PADDING.left + PADDING_EDGE;
    }

    if (tooltipX + tooltipWidth > SVG_WIDTH - PADDING.right - PADDING_EDGE) {
      tooltipX = SVG_WIDTH - PADDING.right - PADDING_EDGE - tooltipWidth;
    }

    if (tooltipY < PADDING.top + PADDING_EDGE) {
      tooltipY = yCoord + 15;
    }

    return { x: tooltipX, y: tooltipY };
  };

  // Generate gridlines
  const gridLines = [];
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = PADDING.top + (PLOT_HEIGHT / gridCount) * i;
    gridLines.push(
      <line
        key={`grid-${i}`}
        x1={PADDING.left}
        y1={y}
        x2={SVG_WIDTH - PADDING.right}
        y2={y}
        stroke="#e2e8f0"
        strokeWidth="1"
      />
    );
  }

  // Generate Y-axis labels
  const yLabels = [];
  for (let i = 0; i <= gridCount; i++) {
    const y = PADDING.top + (PLOT_HEIGHT / gridCount) * i;
    const value = Math.round(chartData.paddedMaxValue - (chartData.paddedMaxValue / gridCount) * i);
    yLabels.push(
      <text
        key={`y-label-${i}`}
        x={PADDING.left - 10}
        y={y + 4}
        fontSize="12"
        fill="#64748b"
        textAnchor="end"
      >
        {formatYAxisLabel(value)}
      </text>
    );
  }

  // Generate X-axis labels with responsive interval
  const labelInterval = getLabelInterval(series.length);
  const xLabels = [];
  for (let i = 0; i < series.length; i += labelInterval) {
    const x = PADDING.left + i * xScale;
    const date = new Date(series[i].date);
    const label = date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    xLabels.push(
      <text key={`x-label-${i}`} x={x} y={SVG_HEIGHT - PADDING.bottom + 20} fontSize="12" fill="#64748b" textAnchor="middle">
        {label}
      </text>
    );
  }

  // Generate data points
  const dataPoints = [];
  chartData.incomeValues.forEach((value, i) => {
    const x = PADDING.left + i * xScale;
    const y = PADDING.top + PLOT_HEIGHT - value * yScale;
    dataPoints.push(
      <circle
        key={`income-point-${i}`}
        cx={x}
        cy={y}
        r="3.5"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        onMouseEnter={() => setHoveredIndex(i)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="cursor-pointer"
      />
    );
  });

  chartData.expenseValues.forEach((value, i) => {
    const x = PADDING.left + i * xScale;
    const y = PADDING.top + PLOT_HEIGHT - value * yScale;
    dataPoints.push(
      <circle
        key={`expense-point-${i}`}
        cx={x}
        cy={y}
        r="3.5"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        onMouseEnter={() => setHoveredIndex(i)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="cursor-pointer"
      />
    );
  });

  const tooltip =
    hoveredIndex !== null
      ? {
          line: (
            <line
              x1={PADDING.left + hoveredIndex * xScale}
              y1={PADDING.top}
              x2={PADDING.left + hoveredIndex * xScale}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="4"
              opacity="0.5"
            />
          ),
          position: getTooltipPosition(
            PADDING.left + hoveredIndex * xScale,
            PADDING.top + PLOT_HEIGHT - chartData.incomeValues[hoveredIndex] * yScale
          ),
          data: series[hoveredIndex],
        }
      : null;

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Chart Area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="block"
        >
          <defs>
            {/* Income gradient: top 30% opacity → bottom 5% opacity */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {gridLines}

          {/* Y-axis */}
          <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + PLOT_HEIGHT} stroke="#94a3b8" strokeWidth="1" />

          {/* X-axis */}
          <line
            x1={PADDING.left}
            y1={PADDING.top + PLOT_HEIGHT}
            x2={SVG_WIDTH - PADDING.right}
            y2={PADDING.top + PLOT_HEIGHT}
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          {yLabels}

          {/* X-axis labels */}
          {xLabels}

          {/* Income area fill with gradient */}
          {incomeAreaPath && <path d={incomeAreaPath} fill="url(#incomeGradient)" />}

          {/* Income line (solid) */}
          <path d={incomePath} stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Expense line (dashed) */}
          <path d={expensePath} stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="5,3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {dataPoints}

          <g
            className="pointer-events-none"
            style={{ opacity: tooltip ? 1 : 0, transition: 'opacity 180ms ease, transform 180ms ease' }}
          >
            {tooltip && (
              <>
                {tooltip.line}
                <g transform={`translate(${tooltip.position.x}, ${tooltip.position.y})`}>
                <rect x="0" y="0" width="160" height="86" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" opacity="0.97" />
                <text x="12" y="19" fontSize="11" fill="#cbd5e1" fontWeight="600">
                  {new Date(tooltip.data.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                </text>
                <circle cx="14" cy="36" r="3.5" fill="#10b981" />
                <text x="24" y="40" fontSize="10" fill="#e2e8f0">Income</text>
                <text x="148" y="40" textAnchor="end" fontSize="10" fill="#f8fafc" fontWeight="600">
                  {formatCurrency(tooltip.data.income)}
                </text>
                <circle cx="14" cy="54" r="3.5" fill="#ef4444" />
                <text x="24" y="58" fontSize="10" fill="#e2e8f0">Expense</text>
                <text x="148" y="58" textAnchor="end" fontSize="10" fill="#f8fafc" fontWeight="600">
                  {formatCurrency(tooltip.data.expense)}
                </text>
                <circle cx="14" cy="72" r="3.5" fill="#3b82f6" />
                <text x="24" y="76" fontSize="10" fill="#e2e8f0">Net</text>
                <text x="148" y="76" textAnchor="end" fontSize="10" fill="#f8fafc" fontWeight="600">
                  {formatCurrency(tooltip.data.net)}
                </text>
                </g>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="shrink-0 flex justify-center gap-4 text-xs py-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-slate-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-600" style={{ height: '2px' }} />
          <span className="text-slate-600">Expense</span>
        </div>
      </div>
    </div>
  );
}
