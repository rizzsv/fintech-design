'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { dashboardApi } from '@/features/dashboard/api';
import type { Notification } from '@/features/dashboard/types';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type: string): string {
  if (type.includes('TOPUP') || type.includes('PAYMENT')) return '💳';
  if (type.includes('TRANSFER')) return '💸';
  if (type.includes('WITHDRAW')) return '🏦';
  if (type.includes('KYC')) return '📋';
  if (type.includes('LOGIN') || type.includes('PASSWORD')) return '🔐';
  return '🔔';
}

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await dashboardApi.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Silently fail for count
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getNotifications({ limit: 20 });
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await dashboardApi.markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllRead || unreadCount === 0) return;

    setMarkingAllRead(true);
    try {
      await dashboardApi.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification);

    // Navigate based on resource type
    if (notification.resource && notification.entityId) {
      const resource = notification.resource.toLowerCase();
      if (resource === 'transaction' || resource === 'payment' || resource === 'withdrawal') {
        router.push(`/transactions`);
      } else if (resource === 'kyc') {
        router.push(`/settings`);
      }
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-50"
                    >
                      {markingAllRead ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCheck className="h-3 w-3" />
                      )}
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close notifications"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[400px] overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                )}

                {error && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      type="button"
                      onClick={fetchNotifications}
                      className="mt-2 text-sm font-medium text-slate-900 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && notifications.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Bell className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                )}

                {!loading && !error && notifications.length > 0 && (
                  <ul className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                            !notification.isRead ? 'bg-slate-50' : ''
                          }`}
                        >
                          <span className="mt-0.5 text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  notification.isRead
                                    ? 'font-normal text-slate-700'
                                    : 'font-semibold text-slate-900'
                                }`}
                              >
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
