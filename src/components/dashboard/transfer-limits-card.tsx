'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { cashFlowTone } from '@/features/dashboard/cash-flow-colors';
import type { DashboardLimits } from '@/features/dashboard/types';

interface TransferLimitsCardProps {
  limits: DashboardLimits;
}

/**
 * Bar colour thresholds are a presentation heuristic only - the backend exposes no
 * warning levels on `LimitDetail`, so nothing here should be read as a business rule.
 */
function barClass(percentage: number): string {
  if (percentage >= 80) return cashFlowTone.net.bar;
  if (percentage >= 50) return cashFlowTone.expense.bar;
  return cashFlowTone.income.bar;
}

export function TransferLimitsCard({ limits }: TransferLimitsCardProps) {
  const rows = [
    { label: 'Daily', detail: limits.dailyTransfer },
    { label: 'Monthly', detail: limits.monthlyTransfer },
  ];

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-[#111827]">Transfer Limits</h3>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {rows.map(({ label, detail }) => {
          const percentage = Math.min(Math.max(detail.percentageUsed, 0), 100);

          return (
            <div key={label} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                  {label}
                </p>
                <p className="text-xs font-semibold tabular-nums text-[#111827]">{percentage}%</p>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                  className={`h-full rounded-full ${barClass(percentage)}`}
                />
              </div>

              <div className="mt-2 flex justify-between gap-2 text-[11px] text-[#6B7280]">
                <span className="tabular-nums">{formatCurrency(detail.used)} used</span>
                <span className="tabular-nums">{formatCurrency(detail.limit)}</span>
              </div>

              <p className="mt-1 text-[11px] tabular-nums text-[#6B7280]">
                {formatCurrency(detail.remaining)} remaining
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
