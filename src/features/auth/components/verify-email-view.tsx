"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { ApiError, authApi } from "@/features/auth/api";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { MailVerificationArt } from "@/features/auth/components/mail-verification-art";

interface VerificationState {
  variant: "check" | "alert";
  title: string;
  description: string;
  primaryLabel: string;
  canRetry?: boolean;
}

function failureState(error: Error): VerificationState {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "EMAIL_ALREADY_VERIFIED":
        return {
          variant: "check",
          title: "Email already verified",
          description:
            "This email address has already been verified, so there is nothing left to do. Sign in to continue to your account.",
          primaryLabel: "Continue to login",
        };
      case "VERIFICATION_TOKEN_EXPIRED":
        return {
          variant: "alert",
          title: "This link has expired",
          description:
            "Verification links stay valid for 24 hours. Sign in with your account to have a new verification email sent to you.",
          primaryLabel: "Back to login",
        };
      case "INVALID_VERIFICATION_TOKEN":
        return {
          variant: "alert",
          title: "This link is no longer valid",
          description:
            "The link may have already been used or was not copied completely. Sign in with your account to request a new verification email.",
          primaryLabel: "Back to login",
        };
      case "VALIDATION_ERROR":
        return {
          variant: "alert",
          title: "This link is incomplete",
          description:
            "The verification link is missing its token. Open the verification button straight from the email we sent you.",
          primaryLabel: "Back to login",
        };
      default:
        if (error.status === 404) {
          return {
            variant: "alert",
            title: "Account not found",
            description:
              "We could not find an account for this verification link. Create a new account to get started.",
            primaryLabel: "Back to login",
          };
        }

        return {
          variant: "alert",
          title: "We could not verify your email",
          description: error.message,
          primaryLabel: "Back to login",
          canRetry: true,
        };
    }
  }

  return {
    variant: "alert",
    title: "We could not verify your email",
    description:
      "The server could not be reached. Check your connection and try the verification link again.",
    primaryLabel: "Back to login",
    canRetry: true,
  };
}

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token")?.trim() ?? "";

  const verification = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: token.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (token && verification.isPending) {
    return (
      <AuthPageShell>
        <MailVerificationArt />
        <h1 className="mt-9 text-center text-[26px] font-bold leading-tight tracking-[-0.01em] text-foreground md:mt-[68px] md:text-[32px]">
          Verifying your email…
        </h1>
        <p className="mt-4 max-w-[534px] text-center text-[13px] leading-[22px] text-[var(--text-subtle)] md:mt-5 md:text-[14px]">
          Hold on for a moment while we confirm your verification link.
        </p>
        <Loader2 className="mt-9 h-6 w-6 animate-spin text-brand" />
      </AuthPageShell>
    );
  }

  let state: VerificationState;

  if (!token) {
    state = failureState(new ApiError("Verification token is missing", 400, "VALIDATION_ERROR"));
  } else if (verification.isError) {
    state = failureState(verification.error);
  } else {
    state = {
      variant: "check",
      title: "Email verified!",
      description: `${verification.data?.email ?? "Your email address"} is now verified. You can sign in and start using your account.`,
      primaryLabel: "Continue to login",
    };
  }

  return (
    <AuthPageShell>
      <MailVerificationArt variant={state.variant} />

      <h1 className="mt-9 text-center text-[26px] font-bold leading-tight tracking-[-0.01em] text-foreground md:mt-[68px] md:text-[32px]">
        {state.title}
      </h1>

      <p className="mt-4 max-w-[534px] text-center text-[13px] leading-[22px] text-[var(--text-subtle)] md:mt-5 md:text-[14px]">
        {state.description}
      </p>

      <Link
        href="/"
        className="mt-9 flex h-[52px] w-full max-w-[512px] items-center justify-center rounded-full bg-brand text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        {state.primaryLabel}
      </Link>

      {state.canRetry && (
        <button
          type="button"
          onClick={() => verification.refetch()}
          disabled={verification.isFetching}
          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-foreground transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50 md:mt-5"
        >
          {verification.isFetching && <Loader2 className="h-[15px] w-[15px] animate-spin" />}
          Try again
        </button>
      )}
    </AuthPageShell>
  );
}
