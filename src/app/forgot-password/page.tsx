"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authApi } from "@/features/auth/api";
import { AuthField } from "@/components/ui/auth-field";
import { OtpInput } from "@/features/auth/components/otp-input";
import { AnimatedNetwork } from "@/components/auth/animated-network";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submitError, setSubmitError] = useState("");

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const requestOtpMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (_, email) => {
      setEmail(email);
      setStep("otp");
      setSubmitError("");
      setResendCooldown(60);
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Failed to send OTP");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => authApi.verifyPasswordResetOtp(email, otp),
    onSuccess: () => {
      setStep("password");
      setOtpError("");
    },
    onError: (error: Error) => {
      setOtpError(error.message || "Invalid OTP");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) => authApi.resetPassword(email, newPassword),
    onSuccess: () => {
      setStep("success");
      setSubmitError("");
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Failed to reset password");
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => {
      setResendCooldown(60);
      setOtpError("");
    },
    onError: (error: Error) => {
      setOtpError(error.message || "Failed to resend OTP");
    },
  });

  const handleEmailSubmit = emailForm.handleSubmit((values) => {
    setSubmitError("");
    requestOtpMutation.mutate(values.email);
  });

  const handleOtpComplete = (otp: string) => {
    setOtpError("");
    verifyOtpMutation.mutate(otp);
  };

  const handlePasswordSubmit = passwordForm.handleSubmit((values) => {
    setSubmitError("");
    resetPasswordMutation.mutate(values.newPassword);
  });

  const handleResendOtp = () => {
    if (resendCooldown === 0) {
      resendOtpMutation.mutate();
    }
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 2) return email;
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mx-auto flex min-h-[680px] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row"
      >
        {/* Left Panel */}
        <div className="relative hidden min-h-[680px] w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 px-8 md:flex">
          <AnimatedNetwork />
          
          <div className="relative z-10 w-full max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold leading-tight text-primary">Veyra</h1>
              <p className="mx-auto mt-4 max-w-sm text-center text-base leading-6 text-muted-foreground">
                Reset your password securely and regain access to your account
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 sm:px-10 md:min-h-[680px] md:w-1/2 md:px-12 md:py-16">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[430px]"
              >
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>

                <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[28px]">
                  Forgot password?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                  Enter your email address and we'll send you a code to reset your password
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
                  <AuthField
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={emailForm.formState.errors.email?.message}
                    {...emailForm.register("email")}
                  />

                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    >
                      {submitError}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={requestOtpMutation.isPending}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
                  >
                    {requestOtpMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[430px]"
              >
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[28px]">
                  Verify your identity
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                  Code sent to
                </p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {maskEmail(email)}
                </p>

                <div className="mt-8">
                  <OtpInput
                    onComplete={handleOtpComplete}
                    error={otpError}
                    loading={verifyOtpMutation.isPending}
                    disabled={verifyOtpMutation.isPending}
                  />
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>Didn't receive it?</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resendOtpMutation.isPending}
                    className="mt-2 font-semibold text-primary transition-colors hover:text-primary/80 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : resendOtpMutation.isPending ? "Sending..." : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                    setOtpError("");
                  }}
                  className="mt-6 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Change email
                </button>
              </motion.div>
            )}

            {step === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[430px]"
              >
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[28px]">
                  Set new password
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                  Choose a strong password for your account
                </p>

                <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
                  <AuthField
                    label="New password"
                    type="password"
                    placeholder="Enter new password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register("newPassword")}
                  />

                  <AuthField
                    label="Confirm password"
                    type="password"
                    placeholder="Confirm new password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register("confirmPassword")}
                  />

                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    >
                      {submitError}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset password
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[430px] text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </motion.div>

                <h2 className="mt-6 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[28px]">
                  Password reset successful
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                  Your password has been changed. You can now sign in with your new password.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg md:text-base"
                >
                  Return to login
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
