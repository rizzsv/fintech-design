'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';

import { dashboardApi } from '@/features/dashboard/api';
import type { DashboardResponse } from '@/features/dashboard/types';
import { useWidgetLayout } from '@/features/dashboard/use-widget-layout';
import {
  COLUMN_COUNT,
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
  stackClass: string;
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
  stackClass,
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
      column: entry.column,
      // `wide` is the one size that leaves its column: the card takes a row of its
      // own across the whole board.
      fullWidth: entry.size === 'wide',
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

      {/* Two independent stacks, not rows of one shared grid: a tall card in one
          column would otherwise inflate the row tracks of the other and leave dead
          space around its neighbours. On mobile the grid collapses to a single
          column, so the stacks simply follow each other. */}
      <DraggableWidgetGrid
        items={widgetItems}
        editing={editing}
        layoutReady={layoutReady}
        columnCount={COLUMN_COUNT}
        columnsClassName={columnsClass}
        stackClassName={stackClass}
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
  }, []);

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
  // The grid only provides the column tracks; each column is a stack that packs at
  // exactly the gap, whatever its cards' heights. Span utilities are `md:`-only so
  // the one-column mobile grid cannot spill into an implicit second column.
  const columnsClass =
    'grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';
  // The stack gap has to match the grid gap, otherwise the two columns' cards stop
  // lining up with each other.
  const stackClass = 'flex min-w-0 flex-col gap-5';

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-[#F5F5F5]">
        <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5">
          <div className={columnsClass}>
            <div className={stackClass}>
              <div className="h-64 animate-pulse rounded-2xl bg-white" />
              <div className="h-40 animate-pulse rounded-2xl bg-white" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
                ))}
              </div>
              <div className="h-40 animate-pulse rounded-2xl bg-white" />
            </div>
            <div className={stackClass}>
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
          stackClass={stackClass}
          itemVariants={itemVariants}
          layoutReady={entranceDone}
        />
      </motion.main>
    </div>
  );
}
