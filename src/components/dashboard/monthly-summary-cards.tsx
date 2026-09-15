'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { DashboardMonthlyStatistics } from '@/features/dashboard/types';

interface MonthlySummaryCardsProps {
  monthlyStats: DashboardMonthlyStatistics;
}

export function MonthlySummaryCards({ monthlyStats }: MonthlySummaryCardsProps) {
  const cards = [
    {
      icon: ArrowDownLeft,
      title: 'Top Up',
      value: monthlyStats.totalTopUp,
    },
    {
      icon: ArrowUpRight,
      title: 'Transfer',
      value: monthlyStats.totalTransfer,
    },
    {
      icon: TrendingUp,
      title: 'Withdrawal',
      value: monthlyStats.totalWithdrawal,
    },
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">This Month</h3>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-slate-100 rounded-lg p-4"
      >
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-slate-600" />
                <p className="text-xs font-medium text-slate-700 uppercase">{card.title}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(card.value)}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
