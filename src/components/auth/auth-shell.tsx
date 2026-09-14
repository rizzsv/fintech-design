"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthBackground } from "@/components/auth/auth-background";
import { AuthLogo } from "@/components/auth/auth-logo";
import { AuthField } from "@/components/ui/auth-field";
import { authApi } from "@/api/auth";
import { loginSchema, registerSchema } from "@/validators/auth";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/auth-store";

const socialButtons = [
  { mark: "G", label: "Google", bg: "bg-white", tone: "text-[#000000]" },
];

export function AuthShell() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const setTokens = useAuthStore((state) => state.setTokens);

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { email: "", phoneNumber: "", password: "", firstName: "", lastName: "" },
  });

  useEffect(() => {
    form.reset(
      isLogin
        ? { email: form.getValues("email") || "", password: "" }
        : { email: form.getValues("email") || "", phoneNumber: "", password: "", firstName: "", lastName: "" },
    );
  }, [isLogin]);

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (isLogin) {
        return authApi.login({
          email: String(payload.email),
          password: String(payload.password),
        });
      }

      if (!agreeTerms) {
        throw new Error("Please accept the terms and conditions.");
      }

      return authApi.register({
        email: String(payload.email),
        phoneNumber: String(payload.phoneNumber),
        password: String(payload.password),
        firstName: payload.firstName ? String(payload.firstName) : undefined,
        lastName: payload.lastName ? String(payload.lastName) : undefined,
      });
    },
    onSuccess: (data, _variables) => {
      if (isLogin && "accessToken" in data && "refreshToken" in data) {
        setTokens(data.accessToken, data.refreshToken);
        setSubmitMessage("Login successful");
        setSubmitError("");
        router.push("/dashboard");
        return;
      }

      setSubmitMessage("Register successful. Please sign in with your new account.");
      setSubmitError("");
      setIsLogin(true);
      form.reset({ email: form.getValues("email"), password: "" });
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Something went wrong");
      setSubmitMessage("");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSubmitError("");
    setSubmitMessage("");
    mutation.mutate(values);
  });

  const formErrors = form.formState.errors;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-3 sm:p-8">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[1220px] rounded-[34px] border border-white/30 shadow-[0_40px_80px_rgba(12,39,97,0.25)]"
      >
        <div className="grid min-h-[700px] overflow-hidden rounded-[28px] bg-transparent md:grid-cols-[1.12fr_0.88fr]">
          <div className="relative overflow-hidden bg-[#0b5fe0] px-6 pb-8 pt-7 md:px-8 md:pb-10 md:pt-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.15),transparent_28%),radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.12),transparent_35%)]" />
            <div className="absolute -right-20 top-[-65px] h-[220px] w-[220px] rounded-full bg-[#0e3d9d]/15 blur-3xl" />
            <div className="absolute -left-20 bottom-[-65px] h-[220px] w-[220px] rounded-full bg-[#0d54c9]/30 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="pl-1">
                <AuthLogo />
              </div>

              <div className="relative mt-8 flex flex-1 items-end justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full max-w-[580px] rounded-[24px] border border-white/25 bg-white/95 p-4 shadow-[0_24px_52px_rgba(17,37,85,0.25)]"
                >
                  <Image
                    src="/animation_for_auth.png"
                    alt="Auth statistics preview"
                    width={620}
                    height={440}
                    priority
                    className="h-auto w-full rounded-[18px] object-cover"
                  />
                </motion.div>
              </div>

              <div className="relative z-10 mt-7 flex flex-col items-center text-center text-[#dfeafc]">
                <p className="text-[0.92rem] font-medium text-white/90">Trusted thousands of finance teams and employees</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-white/80">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2ec4ff]" />
                    coindesk
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d9d9d9]" />
                    Coinbase
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f8b334]" />
                    Crypto Valley
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#f5f5f5] px-6 py-8 sm:px-10 md:px-12">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[430px]"
            >
              <h2 className="text-[2.1rem] font-semibold tracking-[-0.05em] text-slate-900">
                {isLogin ? "Welcome back" : "Create your free account"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {isLogin ? "Enter your details to sign in." : "Already using Veyra? "}
                {!isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="font-medium text-[#0d69e7] hover:underline"
                  >
                    Login here.
                  </button>
                )}
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <AuthField
                        label="Name"
                        placeholder="Nikoloz Narsia"
                        error={formErrors.firstName?.message || formErrors.lastName?.message}
                        {...form.register("firstName")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isLogin && (
                  <AuthField
                    label="Phone number"
                    type="tel"
                    placeholder="081234567890"
                    error={formErrors.phoneNumber?.message}
                    {...form.register("phoneNumber")}
                  />
                )}

                {isLogin && (
                  <AuthField
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    error={formErrors.email?.message}
                    {...form.register("email")}
                  />
                )}

                {!isLogin && (
                  <AuthField
                    label="Email"
                    type="email"
                    placeholder="nikoloznarsia@"
                    error={formErrors.email?.message}
                    {...form.register("email")}
                  />
                )}

                <AuthField
                  label="Password"
                  type="password"
                  placeholder={isLogin ? "Enter password" : "Password (minimum 8 characters)"}
                  error={formErrors.password?.message}
                  {...form.register("password")}
                />

                {!isLogin && (
                  <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-slate-600">
                    <button
                      type="button"
                      aria-label="Accept terms and conditions"
                      onClick={() => setAgreeTerms((v) => !v)}
                      className={cn(
                        "flex h-[18px] w-[18px] items-center justify-center rounded border border-slate-300 bg-white transition-colors",
                        agreeTerms && "border-[#0d69e7] bg-[#0d69e7]",
                      )}
                    >
                      {agreeTerms && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </button>
                    I agree to the <span className="font-medium text-slate-700">Terms & Conditions</span>
                  </label>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                      <button
                        type="button"
                        aria-label="Remember me"
                        onClick={() => setRememberMe((v) => !v)}
                        className={cn(
                          "flex h-[18px] w-[18px] items-center justify-center rounded border border-slate-300 bg-white transition-colors",
                          rememberMe && "border-[#0d69e7] bg-[#0d69e7]",
                        )}
                      >
                        {rememberMe && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </button>
                      Remember me
                    </label>
                    <button type="button" className="text-sm font-medium text-[#0d69e7] hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {submitError && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
                    >
                      {submitError}
                    </motion.p>
                  )}
                  {submitMessage && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      {submitMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="mt-2 flex h-[54px] w-full items-center justify-center rounded-[14px] bg-[#0d5fe5] text-base font-semibold text-white shadow-[0_12px_28px_rgba(13,95,229,0.3)] transition duration-200 hover:bg-[#0b54d1] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Please wait...
                    </span>
                  ) : isLogin ? (
                    "Get Started"
                  ) : (
                    "Get Started"
                  )}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-4">
                {socialButtons.map(({ mark, label, bg, tone }) => (
                  <motion.button
                    key={label}
                    type="button"
                    aria-label={label}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-base font-medium text-slate-700 shadow-sm",
                      bg,
                      tone,
                    )}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#EA4335] text-[0.7rem] font-bold text-white">
                      {mark}
                    </span>
                    {label}
                  </motion.button>
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin((v) => !v);
                    setSubmitError("");
                    setSubmitMessage("");
                  }}
                  className="font-semibold text-[#0d69e7] hover:underline"
                >
                  {isLogin ? "Create account" : "Sign in"}
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
