'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';

import { dashboardApi } from '@/features/dashboard/api';
import type { DashboardResponse } from '@/features/dashboard/types';
import { useWidgetLayout } from '@/features/dashboard/use-widget-layout';
import {
  SIZE_LABEL,
  SPAN_CLASS,
  widgetDefinition,
  type WidgetId,
} from '@/features/dashboard/widget-layout';

import { DashboardCustomizeBar } from '@/components/dashboard/dashboard-customize-bar';
import { DraggableWidgetGrid } from '@/components/dashboard/draggable-widget-grid';
import { FinancialOverviewCard } from '@/components/dashboard/financial-overview-card';
import { TransferLimitsCard } from '@/components/dashboard/transfer-limits-card';
import { CashFlowSummaryCards } from '@/components/dashboard/cash-flow-summary-cards';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { CashFlowChartCard } from '@/components/dashboard/cash-flow-chart-card';
import { AccountOverviewCard } from '@/components/dashboard/account-overview-card';

interface DashboardWidgetsProps {
  dashboard: DashboardResponse;
  columnsClass: string;
  itemVariants: Variants;
  layoutReady: boolean;
}

/**
 * Owns the arrangement of the dashboard widgets.
 *
 * Mounted only once the dashboard request has resolved, so the stored layout is
 * read with a known user id on the very first render - the page's skeleton is what
 * the user sees until then, which is why the saved arrangement can never flash in
 * after a default one.
 */
function DashboardWidgets({
  dashboard,
  columnsClass,
  itemVariants,
  layoutReady,
}: DashboardWidgetsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { layout, reorder, resize, reset } = useWidgetLayout(dashboard.user.id);

  const widgetContent: Record<WidgetId, ReactNode> = {
    'financial-overview': (
      <FinancialOverviewCard
        wallet={dashboard.wallet}
        monthlyStats={dashboard.monthlyStatistics}
        onTopUp={() => router.push('/topup')}
        onTransfer={() => router.push('/transfer')}
      />
    ),
    'recent-transactions': <RecentTransactionsCard transactions={dashboard.recentTransactions} />,
    'transfer-limits': <TransferLimitsCard limits={dashboard.limits} />,
    'cash-flow-summary': <CashFlowSummaryCards cashFlow={dashboard.cashFlow} />,
    'cash-flow-chart': <CashFlowChartCard cashFlow={dashboard.cashFlow} />,
    'account-overview': <AccountOverviewCard accountOverview={dashboard.accountOverview} />,
  };

  const widgetItems = layout.map((entry) => {
    const definition = widgetDefinition(entry.id);

    return {
      id: entry.id,
      label: definition.label,
      size: entry.size,
      sizeOptions: definition.allowedSizes.map((size) => ({
        value: size,
        label: SIZE_LABEL[size],
      })),
      spanClassName: SPAN_CLASS[entry.size],
      content: widgetContent[entry.id],
    };
  });

  return (
    <>
      <DashboardCustomizeBar
        editing={editing}
        onToggleEditing={() => setEditing((current) => !current)}
        onReset={reset}
      />

      {/* One logical grid: the widget order is also the mobile stacking order, and
          the default order reproduces the two-column arrangement the dashboard
          shipped with. */}
      <DraggableWidgetGrid
        items={widgetItems}
        editing={editing}
        layoutReady={layoutReady}
        columnsClassName={columnsClass}
        itemVariants={itemVariants}
        onReorder={reorder}
        onResize={resize}
      />
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entranceDone, setEntranceDone] = useState(false);

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
  // `items-start` keeps every card at its intrinsic height - a widget's size is a
  // grid footprint, never a height override. Span utilities are `md:`-only so the
  // one-column mobile grid cannot spill into an implicit second column.
  const columnsClass =
    'grid grid-cols-1 items-start gap-5 md:grid-flow-row-dense md:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';

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
        onAnimationComplete={() => setEntranceDone(true)}
        className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5"
      >
        <DashboardWidgets
          dashboard={dashboard}
          columnsClass={columnsClass}
          itemVariants={itemVariants}
          layoutReady={entranceDone}
        />
      </motion.main>
    </div>
  );
}
