"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { z } from "zod";

import { ApiError, authApi } from "@/features/auth/api";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { MailVerificationArt } from "@/features/auth/components/mail-verification-art";
import { openInbox } from "@/features/auth/email-inbox";

function resendFeedback(error: Error) {
  if (error instanceof ApiError) {
    if (error.code === "EMAIL_ALREADY_VERIFIED") {
      return "This email is already verified. You can sign in now.";
    }

    if (error.status === 404) {
      return "We could not find an account for this email address.";
    }

    return error.message;
  }

  return "We could not reach the server. Check your connection and try again.";
}

export function CheckEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams?.get("email")?.trim() ?? "";
  const email = z.email().safeParse(emailParam).success ? emailParam : "";
  const isUnverifiedLogin = searchParams?.get("reason") === "unverified";

  useEffect(() => {
    if (!email) {
      router.replace("/");
    }
  }, [email, router]);

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(email),
  });

  if (!email) {
    return null;
  }

  return (
    <AuthPageShell>
      <MailVerificationArt />

      <h1 className="mt-9 text-center text-[26px] font-bold leading-tight tracking-[-0.01em] text-foreground md:mt-[68px] md:text-[32px]">
        Check your email!
      </h1>

      <p className="mt-4 max-w-[534px] text-center text-[13px] leading-[22px] text-[var(--text-subtle)] md:mt-5 md:text-[14px]">
        {isUnverifiedLogin ? (
          <>
            Your email is not verified yet. A verification link was sent to{" "}
            <span className="font-medium text-foreground">{email}</span> and will ask you to click on a
            link to verify that you own this account before you can sign in.
          </>
        ) : (
          <>
            Thanks! An email was sent to <span className="font-medium text-foreground">{email}</span>{" "}
            that will ask you to click on a link to verify that you own this account. If you don’t get
            the email, resend it below.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => openInbox(email)}
        className="mt-9 h-[52px] w-full max-w-[512px] rounded-full bg-brand text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        Open email inbox
      </button>

      <button
        type="button"
        onClick={() => resend.mutate()}
        disabled={resend.isPending}
        className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-foreground transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50 md:mt-5"
      >
        {resend.isPending ? (
          <Loader2 className="h-[15px] w-[15px] animate-spin" />
        ) : (
          <ChevronLeft className="h-[15px] w-[15px]" strokeWidth={2.5} />
        )}
        Resend email
      </button>

      <div aria-live="polite" className="mt-4 min-h-[18px] px-4 text-center text-[12px]">
        {resend.isSuccess && (
          <p className="text-emerald-600">Verification email sent. Check your inbox again.</p>
        )}
        {resend.isError && <p className="text-red-600">{resendFeedback(resend.error)}</p>}
      </div>

      <Link
        href="/"
        className="mt-1 text-[13px] text-[var(--text-subtle)] transition-colors hover:text-foreground"
      >
        Back to login
      </Link>
    </AuthPageShell>
  );
}
