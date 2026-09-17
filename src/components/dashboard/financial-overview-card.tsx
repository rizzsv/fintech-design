'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatShortDate } from '@/lib/format';
import type { DashboardMonthlyStatistics, DashboardWallet } from '@/features/dashboard/types';

interface FinancialOverviewCardProps {
  wallet: DashboardWallet;
  monthlyStats: DashboardMonthlyStatistics;
  onTopUp?: () => void;
  onTransfer?: () => void;
}

/**
 * Wallet status pill.
 *
 * `walletStatus` is a two-member union, so both arms are handled explicitly here
 * rather than through `getStatusStyles`, whose lookup has no `frozen` entry and
 * would fall through to neutral slate - making a frozen wallet read as normal.
 * FROZEN uses the alert tone because it is the state that disables the actions
 * below.
 */
function statusPill(walletStatus: DashboardWallet['walletStatus']) {
  if (walletStatus === 'ACTIVE') {
    return { label: 'Active', className: 'bg-[#E8F5EE] text-[#1A5C38]' };
  }

  return { label: 'Frozen', className: 'bg-[#FDF0EE] text-[#B42318]' };
}

export function FinancialOverviewCard({
  wallet,
  monthlyStats,
  onTopUp,
  onTransfer,
}: FinancialOverviewCardProps) {
  const isFrozen = wallet.walletStatus === 'FROZEN';
  const status = statusPill(wallet.walletStatus);

  const monthlyItems = [
    { label: 'Top Up', value: monthlyStats.totalTopUp },
    { label: 'Transfer', value: monthlyStats.totalTransfer },
    { label: 'Withdrawal', value: monthlyStats.totalWithdrawal },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
            Total Balance
          </p>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2">
          <p className="text-3xl font-light tracking-tight tabular-nums text-[#111827] sm:text-4xl">
            {formatCurrency(wallet.balance)}
          </p>
          <span className="text-xs font-medium text-[#6B7280]">{wallet.currency}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <motion.button
            type="button"
            onClick={onTopUp}
            disabled={isFrozen}
            whileHover={{ scale: isFrozen ? 1 : 1.02 }}
            whileTap={{ scale: isFrozen ? 1 : 0.98 }}
            className="min-w-[120px] flex-1 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Top Up
          </motion.button>
          <motion.button
            type="button"
            onClick={onTransfer}
            disabled={isFrozen}
            whileHover={{ scale: isFrozen ? 1 : 1.02 }}
            whileTap={{ scale: isFrozen ? 1 : 0.98 }}
            className="min-w-[120px] flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Transfer
          </motion.button>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
            This Month
          </p>
          <p className="text-[11px] text-[#6B7280]">
            {formatShortDate(monthlyStats.period.startDate)} &ndash;{' '}
            {formatShortDate(monthlyStats.period.endDate)}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0">
          {monthlyItems.map((item, index) => (
            <div
              key={item.label}
              className={`min-w-0 overflow-hidden ${
                index > 0 ? 'sm:border-l sm:border-[#E5E7EB] sm:pl-4' : ''
              }`}
            >
              <p className="text-xs text-[#6B7280]">{item.label}</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-[#111827]">
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
