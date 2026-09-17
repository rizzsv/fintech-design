'use client';

import React from 'react';

interface TrendSparklineProps {
  values: number[];
  color: string;
}

/**
 * Compact trend line for the cash-flow summary cards.
 *
 * The fixed `h-7 w-20` box (including the sparse-data placeholder) is what keeps
 * the summary cards the same height when a series has fewer than two points.
 */
export function TrendSparkline({ values, color }: TrendSparklineProps) {
  if (values.length < 2) {
    return <div className="h-7 w-20" aria-hidden="true" />;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const path = values
    .map((value, index) => {
      const x = 2 + (index / (values.length - 1)) * 76;
      const y = 3 + (1 - (value - min) / range) * 23;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 80 30" className="h-7 w-20" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
