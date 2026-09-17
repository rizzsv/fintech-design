"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { AnimatedNetwork } from "@/components/auth/animated-network";
import { AuthField } from "@/components/ui/auth-field";
import { authApi, ApiError } from "@/features/auth/api";
import { loginSchema, registerSchema } from "@/features/auth/schemas";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/auth-store";

const socialButtons = [
  { label: "Google", bg: "bg-white", tone: "text-[#000000]" },
];

export function AuthShell() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const setTokens = useAuthStore((state) => state.setTokens);

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { firstName: "", lastName: "", email: "", phoneNumber: "", password: "" },
  });

  useEffect(() => {
    form.reset(
      isLogin
        ? { email: form.getValues("email") || "", password: "" }
        : { firstName: "", lastName: "", email: form.getValues("email") || "", phoneNumber: "", password: "" },
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
        firstName: String(payload.firstName),
        lastName: String(payload.lastName),
      });
    },
    onSuccess: (data) => {
      if (isLogin && "accessToken" in data && "refreshToken" in data) {
        setTokens(data.accessToken, data.refreshToken);
        setSubmitMessage("Login successful");
        setSubmitError("");
        router.push("/dashboard");
        return;
      }

      setSubmitError("");
      setSubmitMessage("");
      router.push(`/check-email?email=${encodeURIComponent("email" in data ? data.email : "")}`);
    },
    onError: (error: Error) => {
      if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
        const email = String(form.getValues("email") ?? "");
        router.push(`/check-email?email=${encodeURIComponent(email)}&reason=unverified`);
        return;
      }

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
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-primary/5 to-primary/10 px-4 py-8 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 mx-auto flex min-h-[680px] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl md:min-h-[calc(100vh-4rem)] md:flex-row"
      >
        {/* Left Panel - Animated Network (hidden on mobile/tablet) */}
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
                Sign in to access your financial dashboard and manage your transactions securely
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 sm:px-10 md:min-h-[680px] md:w-1/2 md:px-12 md:py-16">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1, 0.64, 1] }}
            className="w-full max-w-[430px]"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[28px]"
            >
              {isLogin ? "Welcome back" : "Create your free account"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-2 max-w-full text-sm leading-6 text-muted-foreground md:text-base"
            >
              {isLogin ? "Sign in to your account" : "Already using Veyra? "}
              {!isLogin && (
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  Login here.
                </button>
              )}
            </motion.p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <AuthField
                      label="First Name"
                      autoComplete="given-name"
                      placeholder="John"
                      error={formErrors.firstName?.message}
                      {...form.register("firstName")}
                    />
                    <AuthField
                      label="Last Name"
                      autoComplete="family-name"
                      placeholder="Doe"
                      error={formErrors.lastName?.message}
                      {...form.register("lastName")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <AuthField
                    label="Phone number"
                    type="tel"
                    placeholder="081234567890"
                    error={formErrors.phoneNumber?.message}
                    {...form.register("phoneNumber")}
                  />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: isLogin ? 0.2 : 0.3 }}
              >
                <AuthField
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={formErrors.email?.message}
                  {...form.register("email")}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: isLogin ? 0.25 : 0.35 }}
              >
                <AuthField
                  label="Password"
                  type="password"
                  placeholder={isLogin ? "Enter password" : "Password (minimum 8 characters)"}
                  error={formErrors.password?.message}
                  {...form.register("password")}
                />
              </motion.div>

              {!isLogin && (
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex cursor-pointer flex-wrap items-center gap-2.5 pt-1 text-sm leading-5 text-muted-foreground"
                >
                  <button
                    type="button"
                    aria-label="Accept terms and conditions"
                    onClick={() => setAgreeTerms((v) => !v)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors duration-150",
                      agreeTerms ? "border-primary bg-primary" : "border-input bg-background",
                    )}
                  >
                    {agreeTerms && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </button>
                  I agree to the <span className="font-semibold text-foreground">Terms & Conditions</span>
                </motion.label>
              )}

              {isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1"
                >
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm leading-5 text-muted-foreground">
                    <button
                      type="button"
                      aria-label="Remember me"
                      onClick={() => setRememberMe((v) => !v)}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-colors duration-150",
                        rememberMe ? "border-primary bg-primary" : "border-input bg-background",
                      )}
                    >
                      {rememberMe && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </button>
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    Forgot password?
                  </button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {submitError && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {submitError}
                  </motion.p>
                )}
                {submitMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {submitMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: isLogin ? 0.35 : 0.45 }}
                type="submit"
                disabled={mutation.isPending}
                whileHover={{ scale: mutation.isPending ? 1 : 1.02 }}
                whileTap={{ scale: mutation.isPending ? 1 : 0.96 }}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none md:text-base"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                {socialButtons.map(({ label }) => (
                  <motion.button
                    key={label}
                    type="button"
                    aria-label={label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-background text-sm font-medium text-foreground shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Image
                      src="/google-icon-logo-svgrepo-com.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center text-sm text-muted-foreground"
            >
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin((v) => !v);
                  setSubmitError("");
                  setSubmitMessage("");
                }}
                className="font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
