'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig } from 'framer-motion';

import { AppHeader } from '@/components/layout/app-header';

const ACCESS_TOKEN_KEY = 'accessToken';

function subscribeToAccessToken(onStoreChange: () => void) {
  // Fires when another tab signs in or out.
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function readAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** `localStorage` does not exist while rendering on the server. */
function readServerAccessToken() {
  return null;
}

/**
 * Shared shell for every authenticated route. The header is mounted here exactly
 * once, so no page can define, duplicate or reposition it.
 *
 * `reducedMotion="user"` extends the `prefers-reduced-motion` rule in
 * `globals.css` - which only reaches CSS animations and transitions - to Framer
 * Motion's transform-driven animations.
 */
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  /**
   * Children stay unmounted until a token is known to exist: that both prevents
   * a flash of authenticated content and stops every page from firing API calls
   * it is about to be redirected away from. The token is read through
   * `useSyncExternalStore` so the server snapshot stays separate from the client
   * one instead of causing a hydration mismatch.
   */
  const accessToken = useSyncExternalStore(
    subscribeToAccessToken,
    readAccessToken,
    readServerAccessToken,
  );

  /**
   * `accessToken` is deliberately not a dependency here. During hydration it
   * still holds the server snapshot, so redirecting on it would bounce a
   * signed-in visitor. Effects only run on the client, where `localStorage` is
   * always readable and authoritative.
   */
  useEffect(() => {
    const redirectWhenSignedOut = () => {
      if (!localStorage.getItem(ACCESS_TOKEN_KEY)) router.replace('/');
    };

    redirectWhenSignedOut();

    window.addEventListener('storage', redirectWhenSignedOut);
    return () => window.removeEventListener('storage', redirectWhenSignedOut);
  }, [router]);

  if (!accessToken) {
    return (
      <div
        role="status"
        aria-label="Checking your session"
        className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500"
      >
        Loading...
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        {children}
      </div>
    </MotionConfig>
  );
}
