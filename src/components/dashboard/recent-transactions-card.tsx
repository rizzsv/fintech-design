'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { cashFlowTone } from '@/features/dashboard/cash-flow-colors';
import type { RecentTransaction } from '@/features/dashboard/types';

interface RecentTransactionsCardProps {
  transactions: RecentTransaction[];
  loading?: boolean;
  error?: string;
}

const CARD_SHELL = 'rounded-2xl border border-[#E5E7EB] bg-white';

/** Status is secondary information here, so only non-settled states get a tone. */
function statusToneClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'text-[#8A6A1F]';
    case 'failed':
    case 'cancelled':
    case 'rejected':
      return 'text-[#B42318]';
    default:
      return 'text-[#6B7280]';
  }
}

function CardHeader() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3.5 sm:px-5">
      <h3 className="text-sm font-semibold text-[#111827]">Recent Transactions</h3>
      <Link
        href="/analysis"
        className="text-[11px] font-semibold text-[#1A5C38] transition-colors hover:text-[#1E7A48]"
      >
        View All
      </Link>
    </div>
  );
}

export function RecentTransactionsCard({ transactions, loading, error }: RecentTransactionsCardProps) {
  if (loading) {
    return (
      <section className={CARD_SHELL}>
        <CardHeader />
        <div className="space-y-2 p-4 sm:p-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-[#F5F5F5]" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={CARD_SHELL}>
        <CardHeader />
        <div className="p-4 sm:p-5">
          <div className="rounded-xl border border-[#F5D9D5] bg-[#FDF0EE] p-4 text-sm text-[#B42318]">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <section className={CARD_SHELL}>
        <CardHeader />
        <div className="flex h-40 items-center justify-center p-4 sm:p-5">
          <p className="text-sm text-[#6B7280]">No transactions yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`overflow-hidden ${CARD_SHELL}`}>
      <CardHeader />

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        className="divide-y divide-[#E5E7EB]"
      >
        {transactions.map((tx) => {
          const isIncome = tx.direction === 'INCOME';
          const DirectionIcon = isIncome ? ArrowDownLeft : ArrowUpRight;
          const amountClass = isIncome ? cashFlowTone.income.text : cashFlowTone.expense.text;

          return (
            <motion.li
              key={tx.id}
              variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF9] sm:px-5"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5]"
                aria-hidden="true"
              >
                <DirectionIcon
                  className="h-4 w-4"
                  style={{ color: isIncome ? cashFlowTone.income.hex : cashFlowTone.expense.hex }}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111827]">{tx.type}</p>
                <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">
                  {tx.description ? `${tx.description} · ` : ''}
                  {formatDate(tx.createdAt)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-sm font-semibold tabular-nums ${amountClass}`}>
                  {isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </p>
                <p className={`mt-0.5 text-[11px] capitalize ${statusToneClass(tx.status)}`}>
                  {tx.status.toLowerCase()}
                </p>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
