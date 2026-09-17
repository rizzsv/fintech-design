'use client';

import React from 'react';
import { formatCurrency } from '@/lib/format';
import { cashFlowTone } from '@/features/dashboard/cash-flow-colors';
import type { DashboardCashFlow } from '@/features/dashboard/types';
import { TrendSparkline } from './trend-sparkline';

interface CashFlowSummaryCardsProps {
  cashFlow: DashboardCashFlow;
}

/**
 * Income / Expense / Net summary.
 *
 * The three cards are direct grid children so CSS Grid's default
 * `align-items: stretch` equalises their heights; wrapping each in an extra
 * element would need `h-full` plumbing to get the same result.
 *
 * No change/percentage indicator is rendered: `DashboardCashFlow` carries no
 * comparison period, so any delta would have to be invented.
 */
export function CashFlowSummaryCards({ cashFlow }: CashFlowSummaryCardsProps) {
  const items = [
    {
      label: 'Income',
      value: cashFlow.income,
      tone: cashFlowTone.income,
      trend: cashFlow.series.map((item) => Number(item.income) || 0),
    },
    {
      label: 'Expense',
      value: cashFlow.expense,
      tone: cashFlowTone.expense,
      trend: cashFlow.series.map((item) => Number(item.expense) || 0),
    },
    {
      label: 'Net',
      value: cashFlow.net,
      tone: cashFlowTone.net,
      trend: cashFlow.series.map((item) => Number(item.net) || 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
            {item.label}
          </p>

          {/* `Intl` id-ID emits a non-breaking space after "Rp", so the amount cannot
              wrap. Truncating money would misread (`Rp 1.234.5...`), so the type is
              capped small and the box clips instead. */}
          <p className={`text-lg font-semibold tabular-nums xl:text-xl ${item.tone.text}`}>
            {formatCurrency(item.value)}
          </p>

          <div className="h-7 w-20 shrink-0">
            <TrendSparkline values={item.trend} color={item.tone.hex} />
          </div>
        </div>
      ))}
    </div>
  );
}
