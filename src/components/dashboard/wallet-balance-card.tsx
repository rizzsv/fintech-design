'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import type { DashboardWallet } from '@/features/dashboard/types';

interface WalletBalanceCardProps {
  wallet: DashboardWallet;
  onTopUp?: () => void;
  onTransfer?: () => void;
}

export function WalletBalanceCard({ wallet, onTopUp, onTransfer }: WalletBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -15 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-xl bg-[#0d2c5f] p-6 text-white shadow-sm"
    >
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-200 mb-1">Available Balance</p>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(wallet.balance)}</p>
          <p className="text-sm font-medium text-blue-100">{wallet.currency}</p>
        </div>
      </div>

      <div className="mb-6 text-xs text-blue-100">
        Status: <span className="font-semibold">{wallet.walletStatus}</span>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTopUp}
          type="button"
          disabled={wallet.walletStatus === 'FROZEN'}
          className="flex-1 rounded-lg bg-white text-[#0d2c5f] px-4 py-2 text-sm font-semibold transition-all hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Top Up
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTransfer}
          type="button"
          disabled={wallet.walletStatus === 'FROZEN'}
          className="flex-1 rounded-lg border-2 border-white/30 text-white px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Transfer
        </motion.button>
      </div>
    </motion.div>
  );
}
