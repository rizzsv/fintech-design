'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { dashboardApi } from '@/features/dashboard/api';
import type { DashboardResponse } from '@/features/dashboard/types';

import { FinancialOverviewCard } from '@/components/dashboard/financial-overview-card';
import { TransferLimitsCard } from '@/components/dashboard/transfer-limits-card';
import { CashFlowSummaryCards } from '@/components/dashboard/cash-flow-summary-cards';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { CashFlowChartCard } from '@/components/dashboard/cash-flow-chart-card';
import { AccountOverviewCard } from '@/components/dashboard/account-overview-card';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.replace('/');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Shared between the skeleton and the loaded layout so the two cannot drift.
  const columnsClass =
    'grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-[#F5F5F5]">
        <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5">
          <div className={columnsClass}>
            <div className="min-w-0 space-y-5">
              <div className="h-64 animate-pulse rounded-2xl bg-white" />
              <div className="h-40 animate-pulse rounded-2xl bg-white" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
                ))}
              </div>
              <div className="h-40 animate-pulse rounded-2xl bg-white" />
            </div>
            <div className="min-w-0 space-y-5">
              <div className="h-72 animate-pulse rounded-2xl bg-white" />
              <div className="h-80 animate-pulse rounded-2xl bg-white" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#F5F5F5] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md rounded-2xl border border-[#F5D9D5] bg-[#FDF0EE] p-6 text-[#B42318]"
        >
          <h3 className="mb-2 font-semibold">Dashboard Load Failed</h3>
          <p className="mb-4 text-sm">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.refresh()}
            className="w-full rounded-xl bg-[#B42318] px-4 py-2 text-sm font-medium text-white hover:bg-[#911D13]"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-[#F5F5F5]">
      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5"
      >
        {/* Collapsing to one column stacks these wrappers in DOM order, which gives the
            required mobile sequence: financial card, transfer limits, income/expense/net,
            account overview, recent transactions, cash-flow chart. */}
        <div className={columnsClass}>
          <motion.div className="min-w-0 space-y-5">
            <motion.div variants={itemVariants}>
              <FinancialOverviewCard
                wallet={dashboard.wallet}
                monthlyStats={dashboard.monthlyStatistics}
                onTopUp={() => router.push('/topup')}
                onTransfer={() => router.push('/transfer')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TransferLimitsCard limits={dashboard.limits} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CashFlowSummaryCards cashFlow={dashboard.cashFlow} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <AccountOverviewCard accountOverview={dashboard.accountOverview} />
            </motion.div>
          </motion.div>

          <motion.div className="min-w-0 space-y-5">
            <motion.div variants={itemVariants}>
              <RecentTransactionsCard transactions={dashboard.recentTransactions} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CashFlowChartCard cashFlow={dashboard.cashFlow} />
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
