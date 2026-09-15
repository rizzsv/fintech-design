'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { DashboardAccountOverview } from '@/features/dashboard/types';

interface AccountOverviewCardProps {
  accountOverview: DashboardAccountOverview;
  loading?: boolean;
  error?: string;
}

export function AccountOverviewCard({ accountOverview, loading, error }: AccountOverviewCardProps) {
  const getStatusIcon = (isActive: boolean) =>
    isActive ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    ) : (
      <AlertCircle className="h-5 w-5 text-amber-600" />
    );

  const getStatusColor = (isActive: boolean) => (isActive ? 'text-emerald-700' : 'text-amber-700');
  const getStatusLabel = (isActive: boolean) => (isActive ? 'Active' : 'Inactive');

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-900">Account Overview</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading account status...
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-900">Account Overview</h2>
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      </motion.section>
    );
  }

  const statusItems = [
    {
      label: 'Account',
      value: getStatusLabel(accountOverview.isActive),
      isActive: accountOverview.isActive,
    },
    {
      label: 'Email',
      value: getStatusLabel(accountOverview.isEmailVerified),
      isActive: accountOverview.isEmailVerified,
    },
    {
      label: 'KYC Status',
      value: accountOverview.kyc.status,
      isActive: accountOverview.kyc.status === 'APPROVED',
    },
    {
      label: 'KYC Tier',
      value: accountOverview.kyc.tier,
      isActive: accountOverview.kyc.tier === 'VERIFIED',
    },
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Account Overview</h2>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        {statusItems.map((status) => (
          <motion.div
            key={status.label}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex-1"
          >
            <p className="text-xs font-medium text-slate-600 mb-1">{status.label}</p>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.isActive)}
              <p className={`text-sm font-semibold ${getStatusColor(status.isActive)}`}>{status.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
