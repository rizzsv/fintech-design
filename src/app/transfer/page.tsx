"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Bell, BriefcaseBusiness, CheckCircle2, Home, Search, Send, Settings, Wallet2 } from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type { MeResponse, TransferResponse, WalletResponse } from "@/features/dashboard/types";

const navItems = [
  { icon: Home, path: "/dashboard", label: "Home" },
  { icon: BarChart3, path: "/analysis", label: "Analysis" },
  { icon: Wallet2, path: "/topup", label: "Top up" },
  { icon: Send, path: "/transfer", label: "Transfer" },
  { icon: BriefcaseBusiness, path: "/dashboard", label: "Business" },
  { icon: Settings, path: "/dashboard", label: "Settings" },
];

const TRANSFER_FEE = 2500;

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function TransferPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("100000");
  const [description, setDescription] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [result, setResult] = useState<TransferResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const fee = TRANSFER_FEE;
  const parsedAmount = amount === "" ? 0 : Number(amount);
  const totalDebit = useMemo(() => parsedAmount + fee, [parsedAmount]);
  const name = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "User";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isUuid(recipient.trim())) {
      setError("Enter a valid recipient wallet ID.");
      return;
    }
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid transfer amount.");
      return;
    }
    if (Number(wallet?.balance ?? 0) < totalDebit) {
      setError("Insufficient balance for this transfer and fee.");
      return;
    }
    if (!confirmation) {
      setError("Please confirm the transfer details before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      setResult(await dashboardApi.createTransfer(recipient.trim(), parsedAmount, description.trim() || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete transfer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#cfe6f8] text-slate-700">Loading wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-[#cfe6f8] p-2 sm:p-3 md:p-4">
      <div className="flex min-h-[calc(100vh-1rem)] w-full overflow-hidden rounded-[30px] border border-slate-200/70 bg-[#f4f7fb] shadow-[0_30px_80px_rgba(17,44,100,0.15)] sm:min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)]">
        <aside className="flex w-[92px] shrink-0 flex-col items-center justify-between bg-[#0e2a5c] py-8 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl font-bold">P</div>
          <nav className="mt-8 flex flex-col gap-4">
            {navItems.map(({ icon: Icon, path, label }) => (
              <button key={label} type="button" onClick={() => router.push(path)} aria-label={label} className={`flex h-12 w-12 items-center justify-center rounded-xl ${label === "Transfer" ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6"}`}>
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </nav>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold">{name.charAt(0).toUpperCase()}</div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm"><Search className="h-4 w-4 text-slate-400" /><span className="text-sm text-slate-500">Transfer funds</span></div>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600" aria-label="Notifications"><Bell className="h-4 w-4" /></button>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <button type="button" onClick={() => router.push("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-[#0e2a5c]" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></button>
            <div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">Payments</p><h1 className="text-2xl font-semibold text-slate-800">Transfer funds</h1></div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-[28px] bg-[#0e2a5c] p-6 text-white shadow-sm">
              <p className="text-sm text-blue-100">Available balance</p>
              <p className="mt-3 text-3xl font-semibold">{formatCurrency(wallet?.balance ?? 0)}</p>
              <div className="mt-8 space-y-3 text-sm text-blue-100"><p>Transfer fee <strong className="text-white">{formatCurrency(fee)}</strong></p><p>Recipient wallet balances are credited atomically after all risk and limit checks pass.</p></div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              {result ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Transfer successful</p><p className="text-sm">The recipient has been credited.</p></div></div>
                  <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>{formatCurrency(result.amount)}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-500">Fee</span><strong>{formatCurrency(result.fee)}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-500">Reference</span><strong className="font-mono text-xs text-sky-700">{result.referenceNumber}</strong></div></div>
                  <button type="button" onClick={() => { setResult(null); setConfirmation(false); }} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Make another transfer</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div><h2 className="text-xl font-semibold text-slate-800">Send money</h2><p className="mt-1 text-sm text-slate-500">Enter the recipient wallet ID and transfer amount.</p></div>
                  <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Recipient wallet ID</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="5a044e27-ae12-4bf7-ab37-871a8ec1ad68" className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-800 outline-none focus:border-sky-500" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Amount</span><div className="flex items-center rounded-xl border border-slate-300 px-4 focus-within:border-sky-500"><span className="text-slate-500">Rp</span><input type="text" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={(event) => { const digitsOnly = event.target.value.replace(/\D/g, ""); setAmount(digitsOnly.replace(/^0+(?=\d)/, "")); }} className="w-full border-0 bg-transparent px-3 py-3 text-lg font-semibold text-slate-800 outline-none" /></div><span className="mt-2 block text-xs text-slate-500">Enter a whole IDR amount. Minimum Rp1.</span></label>
                  <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></span><input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={255} placeholder="Lunch, rent, or other note" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500" /></label>
                  <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm"><div className="flex justify-between text-slate-600"><span>Transfer amount</span><span>{formatCurrency(amount)}</span></div><div className="flex justify-between text-slate-600"><span>Fee</span><span>{formatCurrency(fee)}</span></div><div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-800"><span>Total debit</span><span>{formatCurrency(totalDebit)}</span></div></div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-600"><input type="checkbox" checked={confirmation} onChange={(event) => setConfirmation(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0e2a5c]" /><span>I confirm the recipient and amount are correct.</span></label>
                  {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                  <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e2a5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#153d7e] disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" />{submitting ? "Processing transfer..." : "Confirm transfer"}</button>
                </form>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
