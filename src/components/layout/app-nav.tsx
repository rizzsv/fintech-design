'use client';

import { useState } from 'react';
import { ArrowDownToLine, BarChart3, Home, Menu, Send, Settings, Wallet2, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * One entry per authenticated route. Every item must map to a route that exists,
 * so `pathname === path` is enough to drive the active state - no special cases.
 */
const navItems = [
  { icon: Home, path: '/dashboard', label: 'Dashboard' },
  { icon: BarChart3, path: '/analysis', label: 'Mutasi' },
  { icon: Wallet2, path: '/topup', label: 'Top Up' },
  { icon: Send, path: '/transfer', label: 'Transfer' },
  { icon: ArrowDownToLine, path: '/withdrawal', label: 'Withdraw' },
  { icon: Settings, path: '/settings', label: 'Settings' },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        aria-label="Primary navigation"
        className="hidden min-w-0 items-center gap-1 overflow-x-auto md:flex"
      >
        {navItems.map(({ icon: Icon, path, label }) => {
          const active = pathname === path;

          return (
            <motion.button
              key={path}
              type="button"
              onClick={() => router.push(path)}
              aria-current={active ? 'page' : undefined}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                active
                  ? 'bg-black text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-white shadow-xl md:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
                <span className="text-lg font-semibold text-slate-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4" aria-label="Mobile navigation">
                <ul className="space-y-1">
                  {navItems.map(({ icon: Icon, path, label }) => {
                    const active = pathname === path;

                    return (
                      <li key={path}>
                        <button
                          type="button"
                          onClick={() => handleNavigation(path)}
                          aria-current={active ? 'page' : undefined}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium transition-colors ${
                            active
                              ? 'bg-black text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
