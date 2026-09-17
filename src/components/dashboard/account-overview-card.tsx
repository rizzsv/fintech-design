'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cashFlowTone } from '@/features/dashboard/cash-flow-colors';
import type { DashboardAccountOverview } from '@/features/dashboard/types';

interface AccountOverviewCardProps {
  accountOverview: DashboardAccountOverview;
}

export function AccountOverviewCard({ accountOverview }: AccountOverviewCardProps) {
  const statusItems = [
    {
      label: 'Account',
      value: accountOverview.isActive ? 'Active' : 'Inactive',
      isActive: accountOverview.isActive,
    },
    {
      label: 'Email',
      value: accountOverview.isEmailVerified ? 'Verified' : 'Unverified',
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
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-[#111827]">Account Overview</h3>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        {statusItems.map((status) => {
          const Icon = status.isActive ? CheckCircle2 : AlertCircle;
          const tone = status.isActive ? cashFlowTone.income : cashFlowTone.expense;

          return (
            <div key={status.label} className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                {status.label}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0" style={{ color: tone.hex }} />
                <p className={`truncate text-sm font-semibold capitalize ${tone.text}`}>
                  {status.value.toLowerCase()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
