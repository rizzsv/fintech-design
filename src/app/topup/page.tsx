"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Bell, BriefcaseBusiness, CheckCircle2, Copy, ExternalLink, Home, Search, Send, Settings, Wallet2 } from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type { MeResponse, TopUpPaymentResponse, WalletResponse } from "@/features/dashboard/types";

const paymentMethods = [
  { value: "qris", label: "QRIS", description: "Scan and pay with any supported wallet" },
  { value: "gopay", label: "GoPay", description: "Pay directly from your GoPay balance" },
  { value: "bank_transfer", label: "Bank transfer", description: "Use your preferred bank" },
  { value: "shopeepay", label: "ShopeePay", description: "Pay from ShopeePay" },
];

const navItems = [
  { icon: Home, path: "/dashboard", label: "Home" },
  { icon: BarChart3, path: "/analysis", label: "Analysis" },
  { icon: Wallet2, path: "/topup", label: "Top up" },
  { icon: Send, path: "/transfer", label: "Transfer" },
  { icon: BriefcaseBusiness, path: "/dashboard", label: "Business" },
  { icon: Settings, path: "/dashboard", label: "Settings" },
];

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function TopUpPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [amount, setAmount] = useState(100000);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [payment, setPayment] = useState<TopUpPaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/");
      return;
    }

    Promise.all([dashboardApi.getWallet(), dashboardApi.getMe()])
      .then(([walletResponse, profileResponse]) => {
        setWallet(walletResponse);
        setProfile(profileResponse);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load wallet"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!Number.isInteger(amount) || amount < 1000 || amount > 10000000) {
      setError("Amount must be between Rp1,000 and Rp10,000,000.");
      return;
    }

    setSubmitting(true);
    try {
      setPayment(await dashboardApi.createTopUp(amount, paymentMethod));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create payment");
    } finally {
      setSubmitting(false);
    }
  };

  const copyReference = async () => {
    if (!payment) return;
    await navigator.clipboard.writeText(payment.referenceNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#cfe6f8] text-slate-700">Loading wallet...</div>;
  }

  const name = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "User";

  return (
    <div className="min-h-screen bg-[#cfe6f8] p-2 sm:p-3 md:p-4">
      <div className="flex min-h-[calc(100vh-1rem)] w-full overflow-hidden rounded-[30px] border border-slate-200/70 bg-[#f4f7fb] shadow-[0_30px_80px_rgba(17,44,100,0.15)] sm:min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)]">
        <aside className="flex w-[92px] shrink-0 flex-col items-center justify-between bg-[#0e2a5c] py-8 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl font-bold">P</div>
          <nav className="mt-8 flex flex-col gap-4">
            {navItems.map(({ icon: Icon, path, label }) => (
              <button key={label} type="button" onClick={() => router.push(path)} aria-label={label} className={`flex h-12 w-12 items-center justify-center rounded-xl ${label === "Top up" ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6"}`}>
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </nav>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold">{name.charAt(0).toUpperCase()}</div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">Wallet top up</span>
            </div>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <button type="button" onClick={() => router.push("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-[#0e2a5c]" aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">Wallet</p>
              <h1 className="text-2xl font-semibold text-slate-800">Top up your balance</h1>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-[28px] bg-[#0e2a5c] p-6 text-white shadow-sm">
              <p className="text-sm text-blue-100">Available balance</p>
              <p className="mt-3 text-3xl font-semibold">{formatCurrency(wallet?.balance ?? 0)}</p>
              <p className="mt-8 text-sm leading-6 text-blue-100">Add funds securely through Midtrans. Your wallet is credited after the payment gateway confirms settlement.</p>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6"><h2 className="text-xl font-semibold text-slate-800">Add money to wallet</h2><p className="mt-1 text-sm text-slate-500">Choose an amount and payment method to continue.</p></div>

            {payment ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div><p className="font-semibold">Payment created</p><p className="text-sm">Complete payment before the expiry time.</p></div>
                </div>
                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>{formatCurrency(payment.amount)}</strong></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Method</span><strong className="uppercase">{payment.paymentMethod.replace("_", " ")}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Reference</span><button type="button" onClick={copyReference} className="flex items-center gap-2 font-mono text-xs text-sky-700 hover:text-sky-900" title="Copy payment reference">{copied ? "Copied" : payment.referenceNumber}<Copy className="h-4 w-4" /></button></div>
                </div>
                {payment.paymentUrl && <a href={payment.paymentUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e2a5c] px-4 py-3 text-sm font-semibold text-white hover:bg-[#153d7e]">Continue to payment <ExternalLink className="h-4 w-4" /></a>}
                <button type="button" onClick={() => setPayment(null)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Create another top up</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Amount</span><div className="flex items-center rounded-xl border border-slate-300 px-4 focus-within:border-sky-500"><span className="text-slate-500">Rp</span><input type="number" min="1000" max="10000000" step="1000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="w-full border-0 bg-transparent px-3 py-3 text-lg font-semibold text-slate-800 outline-none" /></div><span className="mt-2 block text-xs text-slate-500">Minimum Rp1,000, maximum Rp10,000,000</span></label>
                <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700">Payment method</legend><div className="grid gap-2 sm:grid-cols-2">{paymentMethods.map((method) => <label key={method.value} className={`cursor-pointer rounded-xl border p-3 transition ${paymentMethod === method.value ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}><input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={(event) => setPaymentMethod(event.target.value)} className="sr-only" /><span className="block text-sm font-semibold text-slate-800">{method.label}</span><span className="mt-1 block text-xs text-slate-500">{method.description}</span></label>)}</div></fieldset>
                {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#0e2a5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#153d7e] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Creating payment..." : `Continue with ${formatCurrency(amount)}`}</button>
              </form>
            )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
