'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import type { DashboardLimits } from '@/features/dashboard/types';

interface TransferLimitsCardProps {
  limits: DashboardLimits;
}

export function TransferLimitsCard({ limits }: TransferLimitsCardProps) {
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const dailyPercentage = Math.min(Math.max(limits.dailyTransfer.percentageUsed, 0), 100);
  const monthlyPercentage = Math.min(Math.max(limits.monthlyTransfer.percentageUsed, 0), 100);

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Transfer Limits</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Daily Limit */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Daily</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-slate-700">Usage</p>
              <p className="text-sm font-semibold text-slate-900">{dailyPercentage}%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyPercentage}%` }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                className={`h-full rounded-full ${getBarColor(dailyPercentage)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{formatCurrency(limits.dailyTransfer.used)}</span>
              <span>{formatCurrency(limits.dailyTransfer.limit)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Limit */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Monthly</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-slate-700">Usage</p>
              <p className="text-sm font-semibold text-slate-900">{monthlyPercentage}%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${monthlyPercentage}%` }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                className={`h-full rounded-full ${getBarColor(monthlyPercentage)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{formatCurrency(limits.monthlyTransfer.used)}</span>
              <span>{formatCurrency(limits.monthlyTransfer.limit)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
