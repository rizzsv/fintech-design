"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Bell, BriefcaseBusiness, CheckCircle2, CreditCard, Home, Landmark, Mail, Phone, Search, Send, Settings, ShieldCheck, UserRound, Wallet2, X } from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type { DashboardResponse, MeResponse, WalletResponse } from "@/features/dashboard/types";

const navItems = [
  { icon: Home, active: true },
  { icon: BarChart3 },
  { icon: Wallet2 },
  { icon: Send },
  { icon: BriefcaseBusiness },
  { icon: Settings },
];

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [settingCard, setSettingCard] = useState<WalletResponse | null>(null);
  const [settingCardOpen, setSettingCardOpen] = useState(false);
  const [settingCardLoading, setSettingCardLoading] = useState(false);
  const [settingCardError, setSettingCardError] = useState("");
  const [accountStatusLoading, setAccountStatusLoading] = useState(true);
  const [accountStatusError, setAccountStatusError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/");
      return;
    }


    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();

    const fetchAccountStatus = async () => {
      try {
        const [me, wallet] = await Promise.all([dashboardApi.getMe(), dashboardApi.getWallet()]);
        setProfile(me);
        setSettingCard(wallet);
      } catch (err) {
        setAccountStatusError(err instanceof Error ? err.message : "Unable to load account status");
      } finally {
        setAccountStatusLoading(false);
      }
    };

    fetchAccountStatus();
  }, [router]);

  const balance = useMemo(() => dashboard?.wallet.balance ?? 0, [dashboard]);
  const name = useMemo(
    () => `${dashboard?.user.firstName ?? ""} ${dashboard?.user.lastName ?? ""}`.trim() || "User",
    [dashboard],
  );
  const handleProfileToggle = async () => {
    setProfileOpen((isOpen) => !isOpen);

    if (profile || profileLoading) {
      return;
    }

    setProfileLoading(true);
    setProfileError("");

    try {
      setProfile(await dashboardApi.getMe());
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSettingCardToggle = async () => {
    setSettingCardOpen((isOpen) => !isOpen);

    if (settingCard || settingCardLoading) {
      return;
    }

    setSettingCardLoading(true);
    setSettingCardError("");

    try {
      setSettingCard(await dashboardApi.getWallet());
    }catch (err) {
      setSettingCardError(err instanceof Error ? err.message : "Unable to load wallet");
    }finally {
      setSettingCardLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#cfe6f8] p-2 sm:p-3 md:p-4">
        <div className="flex h-[calc(100vh-1rem)] w-full overflow-hidden rounded-[30px] border border-slate-200/70 bg-[#f4f7fb] shadow-[0_30px_80px_rgba(17,44,100,0.15)] sm:h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)]">
          <aside className="flex w-[92px] flex-col items-center justify-between bg-[#0e2a5c] py-8">
            <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
            <div className="mt-8 flex flex-col gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-12 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
            <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
          </aside>
          <main className="flex-1 px-6 py-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="h-12 flex-1 animate-pulse rounded-2xl bg-white/70" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-white" />
                <div className="h-14 w-44 animate-pulse rounded-2xl bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-[1.8fr_0.95fr] gap-6">
              <div className="space-y-6">
                <div className="h-48 animate-pulse rounded-[28px] bg-[#eef2f7]" />
                <div className="grid gap-4 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
                <div className="grid gap-5 md:grid-cols-[1.3fr_0.8fr]">
                  <div className="h-80 animate-pulse rounded-[26px] bg-white" />
                  <div className="h-80 animate-pulse rounded-[26px] bg-white" />
                </div>
              </div>
              <aside className="space-y-6">
                <div className="h-32 animate-pulse rounded-[28px] bg-[#f0f4f9]" />
                <div className="h-64 animate-pulse rounded-[26px] bg-[#0d2c5f]" />
              </aside>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  const handleNavigationClick = (index: number) => {
    if (index === 1) {
      router.push("/analysis");
    }
    if (index === 2) {
      router.push("/topup");
    }
    if (index === 3) {
      router.push("/transfer");
    }
  };

  return (
    <div className="min-h-screen bg-[#cfe6f8] p-2 sm:p-3 md:p-4">
      <div className="flex h-[calc(100vh-1rem)] w-full overflow-hidden rounded-[30px] border border-slate-200/70 bg-[#f4f7fb] shadow-[0_30px_80px_rgba(17,44,100,0.15)] sm:h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)]">
        <aside className="flex w-[92px] flex-col items-center justify-between bg-[#0e2a5c] py-8 text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl font-bold"
          >
            P
          </motion.div>

          <nav className="mt-8 flex flex-col gap-4">
            {navItems.map(({ icon: Icon, active }, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                type="button"
                onClick={() => handleNavigationClick(index)}
                aria-label={index === 2 ? "Open top up" : index === 3 ? "Open transfer" : `Open navigation item ${index + 1}`}
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.button>
            ))}
          </nav>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold"
          >
            {name.charAt(0).toUpperCase() || "U"}
          </motion.div>
        </aside>

        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex-1 px-6 py-6"
        >
          <motion.div variants={itemVariants} className="mb-6 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value="Search Transactions..."
                readOnly
                className="w-full bg-transparent text-sm text-slate-600 outline-none"
              />
              <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-100">
                Filters
              </button>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Bell className="h-4 w-4" />
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleProfileToggle}
                  aria-expanded={profileOpen}
                  aria-label="Open profile information"
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8e7bf] text-sm font-bold text-[#0e2a5c]">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-800">Hello, {name}</p>
                    <p className="text-xs text-slate-500">Welcome To Dashboard</p>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(17,44,100,0.18)]"
                    >
                      <div className="flex items-start justify-between bg-[#0e2a5c] p-5 text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8e7bf] text-lg font-bold text-[#0e2a5c]">
                            {(profile?.firstName ?? name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{profile ? `${profile.firstName} ${profile.lastName}`.trim() : name}</p>
                            <p className="text-xs text-blue-100">Personal information</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => setProfileOpen(false)}
                          aria-label="Close profile information"
                          className="rounded-full p-1 text-blue-100 hover:bg-white/10 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {profileLoading && <div className="p-5 text-sm text-slate-500">Loading profile...</div>}
                      {profileError && <div className="p-5 text-sm text-red-600">{profileError}</div>}
                      {profile && !profileLoading && !profileError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-4 p-5"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600"><Mail className="h-4 w-4 text-sky-600" /><span>{profile.email}</span></div>
                            <div className="flex items-center gap-3 text-sm text-slate-600"><Phone className="h-4 w-4 text-sky-600" /><span>{profile.phoneNumber || "Phone number not provided"}</span></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                            <div className="rounded-xl bg-slate-50 p-3"><p className="mb-1 text-[11px] text-slate-400">Account</p><p className="flex items-center gap-1 text-sm font-semibold text-slate-700">{profile.account.isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />}{profile.account.isActive ? "Active" : "Inactive"}</p></div>
                            <div className="rounded-xl bg-slate-50 p-3"><p className="mb-1 text-[11px] text-slate-400">KYC status</p><p className="text-sm font-semibold capitalize text-slate-700">{profile.kyc.status.toLowerCase()}</p></div>
                          </div>
                          <div className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2.5 text-xs text-sky-800"><span className="flex items-center gap-2"><UserRound className="h-4 w-4" />Verification</span><span className="font-semibold">{profile.account.isEmailVerified ? "Email verified" : "Pending"}</span></div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-[1.8fr_0.95fr] gap-6">
            <div className="space-y-6">
              <motion.section variants={itemVariants} className="rounded-[28px] bg-[#eef2f7] p-5 shadow-inner">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-800">Account Status</h2>
                </div>

                {accountStatusLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                    Loading account status...
                  </div>
                )}
                {accountStatusError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {accountStatusError}
                  </div>
                )}
                {!accountStatusLoading && !accountStatusError && profile && settingCard && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08 },
                      },
                    }}
                    className="grid gap-3 md:grid-cols-2"
                  >
                    {[
                      { label: "Account status", active: profile.account.isActive, value: profile.account.isActive ? "Active" : "Inactive" },
                      { label: "Email verified", active: profile.account.isEmailVerified, value: profile.account.isEmailVerified ? "Verified" : "Not verified" },
                      { label: "Wallet active", active: !settingCard.isFrozen, value: settingCard.isFrozen ? "Inactive" : "Active" },
                      { label: "KYC Basic", active: profile.kyc.tier.toLowerCase() === "basic", value: profile.kyc.tier },
                    ].map((status) => (
                      <motion.div
                        key={status.label}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          {status.active ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <ShieldCheck className="h-5 w-5 text-amber-500" />}
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{status.label}</p>
                            <p className={`text-xs ${status.active ? "text-emerald-600" : "text-amber-600"}`}>{status.value}</p>
                          </div>
                        </div>
                        {status.label === "KYC Basic" && !status.active && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="rounded-xl bg-[#0d2c5f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#153d7e]"
                          >
                            Verify Identity
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.section>

              <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
                {[
                  { title: "Income", value: 8242, change: "+12.57%", tone: "green" },
                  { title: "Outcome", value: 6121, change: "-5.57%", tone: "red" },
                  { title: "Saved", value: 2102, change: "+8.21%", tone: "blue" },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        {item.title === "Income" ? "↗" : item.title === "Outcome" ? "↘" : "▣"}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(item.value)}</p>
                        <p className={`text-xs font-medium ${item.tone === "green" ? "text-emerald-500" : item.tone === "red" ? "text-red-500" : "text-sky-500"}`}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="grid gap-5 md:grid-cols-[1.3fr_0.8fr]">
                <motion.section
                  whileHover={{ y: -2 }}
                  className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-800">Balance Analytic</h3>
                    <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200">
                      By Day
                    </button>
                  </div>

                  <div className="flex h-[220px] items-end gap-2">
                    {[35, 52, 40, 68, 74, 64, 90].map((height, idx) => (
                      <div key={idx} className="flex flex-1 flex-col items-center gap-3">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}px` }}
                          transition={{ delay: 0.6 + idx * 0.08, type: "spring", stiffness: 100 }}
                          className="w-full rounded-t-xl bg-blue-100"
                        />
                        <span className="text-[10px] text-slate-400">{["07 Am", "08 Am", "09 Am", "10 Am", "11 Am", "12 Pm", "01 Pm"][idx]}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  whileHover={{ y: -2 }}
                  className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-5 text-xl font-semibold text-slate-800">Investment</h3>
                  <div className="space-y-4">
                    {[
                      { name: "AAPL", value: 4703.98, delta: "+19.77", color: "bg-amber-100" },
                      { name: "FB2A.BE", value: 2421.4, delta: "-10.40", color: "bg-sky-100" },
                      { name: "GOOGL", value: 1203.78, delta: "+27.58", color: "bg-emerald-100" },
                    ].map((stock, idx) => (
                      <motion.div
                        key={stock.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stock.color} text-xs font-bold text-slate-700`}>
                            {stock.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">{stock.name}</div>
                            <div className="text-[11px] text-slate-500">Apple Inc.</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-700">{formatCurrency(stock.value)}</div>
                          <div className="text-[11px] text-emerald-500">{stock.delta}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
                  >
                    <Landmark className="h-4 w-4" />
                    Add Investment
                  </motion.button>
                </motion.section>
              </motion.div>
            </div>

            <motion.aside variants={itemVariants} className="space-y-6">
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-[28px] bg-[#f0f4f9] p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff6ff] text-sky-700">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">My Card</p>
                      <p className="text-xs text-slate-500">Active Balance</p>
                    </div>
                  </div>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={handleSettingCardToggle}
                      aria-expanded={settingCardOpen}
                      aria-label="Open card settings"
                      className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      <Settings className="h-4 w-4" />
                    </motion.button>

                    <AnimatePresence>
                      {settingCardOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(17,44,100,0.18)]"
                        >
                          <div className="flex items-start justify-between bg-[#0e2a5c] p-5 text-white">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8e7bf] text-[#0e2a5c]">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold">Card information</p>
                                <p className="text-xs text-blue-100">{settingCard?.currency ?? "IDR"} wallet</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => setSettingCardOpen(false)}
                              aria-label="Close card information"
                              className="rounded-full p-1 text-blue-100 hover:bg-white/10 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </div>

                          {settingCardLoading && <div className="p-5 text-sm text-slate-500">Loading card information...</div>}
                          {settingCardError && <div className="p-5 text-sm text-red-600">{settingCardError}</div>}
                          {settingCard && !settingCardLoading && !settingCardError && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="space-y-4 p-5"
                            >
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Available balance</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-800">{formatCurrency(settingCard.balance)}</p>
                              </div>
                              <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Currency</span>
                                <span className="font-semibold text-slate-800">{settingCard.currency}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Wallet status</span>
                                <span className={`font-semibold ${settingCard.isFrozen ? "text-amber-600" : "text-emerald-600"}`}>
                                  {settingCard.isFrozen ? "Frozen" : "Active"}
                                </span>
                              </div>
                              <div className="border-t border-slate-100 pt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Wallet owner</p>
                                <p className="text-sm font-semibold text-slate-800">{settingCard.user.firstName} {settingCard.user.lastName}</p>
                                <p className="mt-1 text-xs text-slate-500">{settingCard.user.email}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-slate-50 p-3">
                                  <p className="text-[11px] text-slate-400">KYC status</p>
                                  <p className="mt-1 text-sm font-semibold capitalize text-slate-700">{settingCard.user.kycStatus.toLowerCase()}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                  <p className="text-[11px] text-slate-400">KYC tier</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-700">{settingCard.user.kycTier}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Version {settingCard.version}</span>
                                <span>Updated {formatDate(settingCard.updatedAt)}</span>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, rotateY: -15 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-[26px] bg-[#0d2c5f] p-5 text-white shadow-lg"
                >
                  <div className="mb-6 flex items-center justify-between text-xs text-blue-100">
                    <span>Card Primary</span>
                    <span>•••• 9090</span>
                  </div>
                  <div className="mb-6 text-4xl font-bold tracking-tight">{formatCurrency(balance)}</div>
                  <div className="flex items-center justify-between text-xs text-blue-100">
                    <span>Visa</span>
                    <span className="font-medium">{name}</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.aside>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
