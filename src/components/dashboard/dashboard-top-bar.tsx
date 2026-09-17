'use client';

import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardNavigation } from './dashboard-navigation';

/** Shared avatar chip classes, so an interactive trigger can match the static chip. */
export const topBarAvatarChipClass =
  'flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm';
export const topBarAvatarClass =
  'flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700';

interface DashboardTopBarProps {
  userInitial: string;
  /**
   * Replaces the static avatar chip when a page needs an interactive profile
   * section (see `DashboardHeader`). Keeping it a slot means the sticky shell,
   * navigation and notification button exist in exactly one place.
   */
  profileSlot?: ReactNode;
}

export function DashboardTopBar({ userInitial, profileSlot }: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-30 mb-6 flex min-h-16 items-center justify-between gap-6 border-b border-slate-200 bg-white px-1 pb-3">
      <div className="min-w-0 flex-1">
        <DashboardNavigation />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </motion.button>
        {profileSlot ?? (
          <div className={topBarAvatarChipClass}>
            <span className={topBarAvatarClass}>{userInitial.toUpperCase()}</span>
          </div>
        )}
      </div>
    </header>
  );
}