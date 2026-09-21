'use client';

import { ArrowDownToLine, BarChart3, Home, Send, Settings, Wallet2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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

  return (
    <nav
      aria-label="Primary navigation"
      className="flex min-w-0 items-center gap-1 overflow-x-auto"
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
  );
}
