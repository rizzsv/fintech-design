'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/format';
import type { RecentTransaction } from '@/features/dashboard/types';

interface RecentTransactionsCardProps {
  transactions: RecentTransaction[];
  loading?: boolean;
  error?: string;
}

export function RecentTransactionsCard({ transactions, loading, error }: RecentTransactionsCardProps) {
  if (loading) {
    return (
      <motion.section
        whileHover={{ y: -2 }}
        className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Recent Transactions</h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        whileHover={{ y: -2 }}
        className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Recent Transactions</h3>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      </motion.section>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <motion.section
        whileHover={{ y: -2 }}
        className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Recent Transactions</h3>
        <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-50">
          <p className="text-sm text-slate-500">No transactions yet</p>
        </div>
      </motion.section>
    );
  }

  const getStatusBadgeStyles = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'success') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (statusLower === 'pending') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (statusLower === 'failed' || statusLower === 'cancelled') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <motion.section
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700"
        >
          View All
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 text-right font-medium" />
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            {transactions.map((tx) => {
              const isIncome = tx.direction === 'INCOME';

              return (
                <motion.tr
                  key={tx.id}
                  variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                  className="border-b border-slate-200 transition-colors last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-mono text-xs font-medium text-slate-800">
                    {tx.reference || tx.id.slice(0, 12)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-800">{tx.type}</p>
                    {tx.description && <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">{tx.description}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{formatDate(tx.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded px-2 py-1 text-[11px] font-semibold capitalize ${getStatusBadgeStyles(tx.status)}`}>
                      {tx.status.toLowerCase()}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-4 py-4 text-right font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" className="text-xs font-semibold text-slate-700 hover:text-sky-600">
                      View
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
          <tfoot className="border-t border-slate-200">
            <tr>
              <td colSpan={5} className="px-5 py-3 text-xs font-semibold text-slate-600">
                Showing {transactions.length} recent transaction{transactions.length === 1 ? '' : 's'}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.section>
  );
}
