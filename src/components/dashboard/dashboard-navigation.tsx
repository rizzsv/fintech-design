'use client';

import { BarChart3, Home, Send, Settings, Wallet2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, path: '/dashboard', label: 'Dashboard' },
  { icon: BarChart3, path: '/analysis', label: 'Mutasi' },
  { icon: Wallet2, path: '/topup', label: 'Wallet' },
  { icon: Send, path: '/transfer', label: 'Transfer' },
  { icon: Settings, path: '/dashboard', label: 'Settings' },
];

export function DashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav aria-label="Primary navigation" className="flex min-w-0 items-center gap-1 overflow-x-auto">
      {navItems.map(({ icon: Icon, path, label }) => (
        <motion.button
          key={label}
          type="button"
          onClick={() => router.push(path)}
          aria-label={label}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === path && (path !== '/dashboard' || label === 'Dashboard') ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </motion.button>
      ))}
    </nav>
  );
}
