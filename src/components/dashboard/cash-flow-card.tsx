'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import type { DashboardCashFlow } from '@/features/dashboard/types';
import { CashFlowChart } from './cash-flow-chart';

interface CashFlowCardProps {
  cashFlow: DashboardCashFlow;
}

function TrendSparkline({ values, color }: { values: number[]; color: string }) {
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

export function CashFlowCard({ cashFlow }: CashFlowCardProps) {
  const hasChartData = cashFlow?.series && cashFlow.series.length > 0;
  const summaryItems = [
    {
      label: 'Income',
      value: cashFlow.income,
      color: '#10b981',
      trend: cashFlow.series.map((item) => Number(item.income) || 0),
      valueClassName: 'text-emerald-600',
    },
    {
      label: 'Expense',
      value: cashFlow.expense,
      color: '#ef4444',
      trend: cashFlow.series.map((item) => Number(item.expense) || 0),
      valueClassName: 'text-red-600',
    },
    {
      label: 'Net',
      value: cashFlow.net,
      color: '#3b82f6',
      trend: cashFlow.series.map((item) => Number(item.net) || 0),
      valueClassName: 'text-blue-600',
    },
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Cash Flow</h3>

      <div className="rounded-lg border border-slate-100 bg-white p-4">
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(180px,0.75fr)_minmax(0,1.75fr)]">
          <div className="min-w-0 px-1 py-2">
            {summaryItems.map((item) => (
              <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_80px] items-center gap-3 border-b border-slate-200/70 py-4 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-600">{item.label}</p>
                  <p className={`mt-1 truncate text-base font-bold ${item.valueClassName}`}>{formatCurrency(item.value)}</p>
                </div>
                <TrendSparkline values={item.trend} color={item.color} />
              </div>
            ))}
          </div>

          {hasChartData ? (
            <div className="min-w-0 overflow-hidden p-2 h-[300px] sm:h-[340px] lg:h-[380px]">
              <CashFlowChart series={cashFlow.series} />
            </div>
          ) : (
            <div className="flex min-w-0 items-center justify-center overflow-hidden p-4 h-[300px] sm:h-[340px] lg:h-[380px]">
              <p className="text-sm text-slate-600">Historical cash flow chart is not available yet</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
