'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

import { AppHeader } from '@/components/layout/app-header';

/**
 * Shared shell for every authenticated route. The header is mounted here exactly
 * once, so no page can define, duplicate or reposition it.
 *
 * `reducedMotion="user"` extends the `prefers-reduced-motion` rule in
 * `globals.css` - which only reaches CSS animations and transitions - to Framer
 * Motion's transform-driven animations.
 */
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        {children}
      </div>
    </MotionConfig>
  );
}
