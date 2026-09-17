'use client';

import React from 'react';
import type { DashboardCashFlow } from '@/features/dashboard/types';
import { CashFlowChart } from './cash-flow-chart';

interface CashFlowChartCardProps {
  cashFlow: DashboardCashFlow;
}

export function CashFlowChartCard({ cashFlow }: CashFlowChartCardProps) {
  const hasChartData = cashFlow?.series && cashFlow.series.length > 0;

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-[#111827]">Cash Flow</h3>
        <p className="text-[11px] text-[#6B7280]">{cashFlow.period}</p>
      </div>

      {hasChartData ? (
        // The box tracks the chart's own 440x300 viewBox plus ~24px for the legend
        // row, so `preserveAspectRatio="xMidYMid meet"` has no slack to letterbox.
        <div className="mt-3 aspect-[440/324] min-h-[280px] w-full min-w-0">
          <CashFlowChart series={cashFlow.series} />
        </div>
      ) : (
        <div className="mt-3 flex min-h-[280px] items-center justify-center">
          <p className="text-sm text-[#6B7280]">Historical cash flow chart is not available yet</p>
        </div>
      )}
    </section>
  );
}
