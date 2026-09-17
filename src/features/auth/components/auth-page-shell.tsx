import Link from "next/link";
import type { ReactNode } from "react";

/**
 * White, minimal auth page chrome used by the email verification screens:
 * brand lockup top-left, sign-in prompt top-right, content block, footer bottom-left.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Veyra home">
          <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-brand">
            <span className="relative block h-3.5 w-3.5">
              <span className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white" />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-white/70" />
            </span>
          </span>
          <span className="text-[19px] font-bold leading-none tracking-[-0.02em] text-foreground">
            Veyra
          </span>
        </Link>

        <p className="text-right text-[12px] text-[var(--text-subtle)] md:text-[13px]">
          Already have an account?{" "}
          <Link href="/" className="font-medium text-brand transition-colors hover:text-brand/80">
            Sign in
          </Link>
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-10 pt-10 md:pt-[100px]">{children}</main>

      <footer className="flex items-center gap-3 px-6 pb-6 text-[11px] text-[var(--text-subtle)] md:px-10 md:text-[12px]">
        <span>Copyright &copy;{new Date().getFullYear()}</span>
        <span aria-hidden className="h-3 w-px bg-black/10" />
        <span>Privacy Policy</span>
      </footer>
    </div>
  );
}
