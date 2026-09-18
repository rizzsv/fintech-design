'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LogOut, X } from 'lucide-react';

import { authApi } from '@/features/auth/api';
import { dashboardApi } from '@/features/dashboard/api';
import type { MeResponse } from '@/features/dashboard/types';
import { useAuthStore } from '@/store/auth-store';

import { AppNav } from './app-nav';

/**
 * The single header for every authenticated route. It is rendered once by
 * `src/app/(authenticated)/layout.tsx`, so pages never mount, position or size
 * it - and cannot drift apart. All identity (height, spacing, radius, colour,
 * animation, sticky offset) is owned here; the active nav item comes from the
 * router, and the profile section comes from the authenticated user.
 */
export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);

  // The header now outlives navigation, so the menu is tied to the route it was
  // opened on. Deriving `profileOpen` from that closes it on navigation without
  // an effect that syncs state.
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const profileOpen = openedOnPath === pathname;

  useEffect(() => {
    let active = true;

    // Pages own the redirect for unauthenticated visitors; the header only skips
    // a request it knows would fail.
    const load = async () =>
      localStorage.getItem('accessToken') ? dashboardApi.getMe() : null;

    load()
      .then((response) => {
        if (active && response) setProfile(response);
      })
      .catch((error: unknown) => {
        if (active) {
          setProfileError(error instanceof Error ? error.message : 'Unable to load profile');
        }
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const userName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'User';
  const userInitial = (userName.charAt(0) || 'U').toUpperCase();

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      clearTokens();
      router.replace('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      {/* Fixed h-16 keeps the bar exactly 64px tall at every breakpoint: the nav's
          horizontal scrollbar on narrow screens eats into the row instead of
          growing it. */}
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <AppNav />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setOpenedOnPath(profileOpen ? null : pathname)}
              aria-expanded={profileOpen}
              aria-label={`Open profile information for ${userName}`}
              className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                {userInitial}
              </span>
            </motion.button>

            <AnimatePresence>
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
                        {userInitial}
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
                      onClick={() => setOpenedOnPath(null)}
                      aria-label="Close profile information"
                      className="rounded-full p-1 text-blue-100 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {profileLoading && (
                    <div className="p-5 text-sm text-slate-500">Loading profile...</div>
                  )}
                  {profileError && <div className="p-5 text-sm text-red-600">{profileError}</div>}
                  {profile && !profileLoading && !profileError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4 p-5"
                    >
                      <div className="space-y-3">
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Email: </span>
                          {profile.email}
                        </div>
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Phone: </span>
                          {profile.phoneNumber || 'Not provided'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-400">Account</p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {profile.account.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-400">Email Verified</p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {profile.account.isEmailVerified ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-sky-50 px-3 py-2.5 text-xs text-sky-800">
                        <p className="font-semibold">KYC Status: {profile.kyc.status}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="border-t border-slate-100 p-5 pt-4">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {logoutLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
