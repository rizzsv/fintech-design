'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BriefcaseBusiness, Home, Send, Settings, Wallet2 } from 'lucide-react';
import { Dock, DockIcon } from '@/components/ui/dock';

const navItems = [
  { icon: Home, path: '/dashboard', label: 'Home' },
  { icon: BarChart3, path: '/analysis', label: 'Analysis' },
  { icon: Wallet2, path: '/topup', label: 'Top up' },
  { icon: Send, path: '/transfer', label: 'Transfer' },
  { icon: BriefcaseBusiness, path: '/dashboard', label: 'Business' },
  { icon: Settings, path: '/dashboard', label: 'Settings' },
];

interface DashboardSidebarProps {
  userInitial: string;
}

export function DashboardSidebar({ userInitial }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed inset-y-3 left-3 z-40 flex w-[62px] flex-col items-center rounded-[22px] bg-black py-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:inset-y-4 sm:left-4 sm:w-[68px]">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-black">P</div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Dock direction="vertical" iconSize={40} iconMagnification={54} iconDistance={90} className="border-0 bg-transparent p-0">
          {navItems.map(({ icon: Icon, path, label }) => {
            const active = pathname === path;

            return (
              <DockIcon
                key={label}
                onClick={() => router.push(path)}
                aria-label={label}
                className={`transition-colors ${active ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/10'}`}
              >
                <Icon className="h-5 w-5" />
              </DockIcon>
            );
          })}
        </Dock>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-black"
        aria-label="Open dashboard"
      >
        {userInitial.toUpperCase()}
      </button>
    </aside>
  );
}