'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import {
  DashboardTopBar,
  topBarAvatarChipClass,
  topBarAvatarClass,
} from './dashboard-top-bar';

interface DashboardHeaderProps {
  userName: string;
  userInitial: string;
  onProfileClick: () => void;
  profileOpen: boolean;
  profileData?: {
    email: string;
    phoneNumber?: string;
    accountActive: boolean;
    emailVerified: boolean;
    kycStatus: string;
  };
  profileLoading?: boolean;
  profileError?: string;
  onLogout: () => void;
  logoutLoading?: boolean;
}

/**
 * Wallet/Transfer render `DashboardTopBar` directly; pages that also need the
 * profile menu render it through here. The sticky shell, navigation and
 * notification button therefore live only in `DashboardTopBar`, and this file
 * contributes just the interactive profile section.
 */
export function DashboardHeader({
  userName,
  userInitial,
  onProfileClick,
  profileOpen,
  profileData,
  profileLoading,
  profileError,
  onLogout,
  logoutLoading,
}: DashboardHeaderProps) {
  return (
    <DashboardTopBar
      userInitial={userInitial}
      profileSlot={
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onProfileClick}
            aria-expanded={profileOpen}
            aria-label={`Open profile information for ${userName}`}
            className={`${topBarAvatarChipClass} transition-colors hover:bg-slate-50`}
          >
            <span className={topBarAvatarClass}>{userInitial.toUpperCase()}</span>
          </motion.button>

          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(17,44,100,0.18)]"
            >
              <div className="flex items-start justify-between bg-[#0e2a5c] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8e7bf] text-lg font-bold text-[#0e2a5c]">
                    {userInitial.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{userName}</p>
                    <p className="text-xs text-blue-100">Personal information</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onProfileClick}
                  aria-label="Close profile information"
                  className="rounded-full p-1 text-blue-100 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {profileLoading && <div className="p-5 text-sm text-slate-500">Loading profile...</div>}
              {profileError && <div className="p-5 text-sm text-red-600">{profileError}</div>}
              {profileData && !profileLoading && !profileError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4 p-5"
                >
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold">Email: </span>
                      {profileData.email}
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold">Phone: </span>
                      {profileData.phoneNumber || 'Not provided'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">Account</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {profileData.accountActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">Email Verified</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {profileData.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-sky-50 px-3 py-2.5 text-xs text-sky-800">
                    <p className="font-semibold">KYC Status: {profileData.kycStatus}</p>
                  </div>
                </motion.div>
              )}

              <div className="border-t border-slate-100 p-5 pt-4">
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={logoutLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {logoutLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      }
    />
  );
}
