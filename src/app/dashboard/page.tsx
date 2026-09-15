'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { authApi } from '@/features/auth/api';
import { dashboardApi } from '@/features/dashboard/api';
import type { DashboardResponse, MeResponse } from '@/features/dashboard/types';
import { useAuthStore } from '@/store/auth-store';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { WalletBalanceCard } from '@/components/dashboard/wallet-balance-card';
import { AccountOverviewCard } from '@/components/dashboard/account-overview-card';
import { MonthlySummaryCards } from '@/components/dashboard/monthly-summary-cards';
import { CashFlowCard } from '@/components/dashboard/cash-flow-card';
import { TransferLimitsCard } from '@/components/dashboard/transfer-limits-card';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [accountStatusLoading, setAccountStatusLoading] = useState(true);
  const [accountStatusError, setAccountStatusError] = useState('');
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);

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

    const fetchAccountStatus = async () => {
      try {
        const me = await dashboardApi.getMe();
        setProfile(me);
      } catch (err) {
        setAccountStatusError(err instanceof Error ? err.message : 'Unable to load account status');
      } finally {
        setAccountStatusLoading(false);
      }
    };

    fetchDashboard();
    fetchAccountStatus();
  }, [router]);

  const userName = useMemo(
    () => `${dashboard?.user.firstName ?? ''} ${dashboard?.user.lastName ?? ''}`.trim() || 'User',
    [dashboard],
  );

  const userInitial = useMemo(() => userName.charAt(0) || 'U', [userName]);

  const handleProfileToggle = () => {
    setProfileOpen((isOpen) => !isOpen);
  };

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      clearTokens();
      router.replace('/');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white grayscale">
        <div className="flex min-h-screen w-full overflow-hidden bg-white">
          <main className="min-h-screen flex-1 px-4 py-5 sm:px-6 sm:py-6">
            <div className="mb-6 h-12 w-full animate-pulse rounded-2xl bg-white/70" />
            <div className="grid grid-cols-[1.8fr_0.95fr] gap-6">
              <div className="space-y-6">
                <div className="h-32 animate-pulse rounded-[28px] bg-[#eef2f7]" />
                <div className="grid gap-4 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
                <div className="h-80 animate-pulse rounded-[26px] bg-white" />
              </div>
              <div className="space-y-6">
                <div className="h-64 animate-pulse rounded-[26px] bg-[#0d2c5f]" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 max-w-md"
        >
          <h3 className="font-semibold mb-2">Dashboard Load Failed</h3>
          <p className="text-sm mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.refresh()}
            className="w-full rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
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
    <div className="min-h-screen bg-[#ededed] grayscale">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">
        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="min-h-screen flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-6 sm:py-5"
        >
          <DashboardHeader
            userName={userName}
            userInitial={userInitial}
            onProfileClick={handleProfileToggle}
            profileOpen={profileOpen}
            profileData={
              profile
                ? {
                    email: profile.email,
                    phoneNumber: profile.phoneNumber,
                    accountActive: profile.account.isActive,
                    emailVerified: profile.account.isEmailVerified,
                    kycStatus: profile.kyc.status,
                  }
                : undefined
            }
            onLogout={handleLogout}
            logoutLoading={logoutLoading}
          />

          <div className="w-full space-y-6">
            <motion.div variants={itemVariants}>
              <WalletBalanceCard
                wallet={dashboard.wallet}
                onTopUp={() => router.push('/topup')}
                onTransfer={() => router.push('/transfer')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <AccountOverviewCard
                accountOverview={dashboard.accountOverview}
                loading={accountStatusLoading}
                error={accountStatusError}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <MonthlySummaryCards monthlyStats={dashboard.monthlyStatistics} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CashFlowCard cashFlow={dashboard.cashFlow} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TransferLimitsCard limits={dashboard.limits} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <RecentTransactionsCard transactions={dashboard.recentTransactions} />
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
