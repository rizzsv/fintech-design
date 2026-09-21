"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Info, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardApi } from "@/features/dashboard/api";
import type { WalletResponse } from "@/features/dashboard/types";

const MINIMUM_WITHDRAWAL = 50_000;
const MAXIMUM_WITHDRAWAL = 10_000_000;
const WITHDRAWAL_FEE = 5_000;

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

interface WithdrawalResult {
  id: string;
  referenceNumber: string;
  status: string;
  amount: number;
  fee: number;
  createdAt: string;
}

const banks = [
  { value: "bca", label: "BCA", description: "Bank Central Asia" },
  { value: "mandiri", label: "Mandiri", description: "Bank Mandiri" },
  { value: "bni", label: "BNI", description: "Bank Negara Indonesia" },
  { value: "bri", label: "BRI", description: "Bank Rakyat Indonesia" },
];

export default function WithdrawalPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [bankCode, setBankCode] = useState("bca");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("100000");
  const [confirmation, setConfirmation] = useState(false);
  const [result, setResult] = useState<WithdrawalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/");
      return;
    }

    dashboardApi
      .getWallet()
      .then(setWallet)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load wallet"))
      .finally(() => setLoading(false));
  }, [router]);

  const parsedAmount = amount === "" ? 0 : Number(amount);
  const fee = WITHDRAWAL_FEE;
  const totalDebit = parsedAmount + fee;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!accountNumber.trim() || !accountName.trim()) {
      setError("Enter valid bank account details.");
      return;
    }
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount < MINIMUM_WITHDRAWAL || parsedAmount > MAXIMUM_WITHDRAWAL) {
      setError(`Amount must be between ${formatCurrency(MINIMUM_WITHDRAWAL)} and ${formatCurrency(MAXIMUM_WITHDRAWAL)}.`);
      return;
    }
    if (Number(wallet?.balance ?? 0) < totalDebit) {
      setError("Insufficient balance for this withdrawal and fee.");
      return;
    }
    if (!confirmation) {
      setError("Please confirm the withdrawal details before continuing.");
      return;
    }

    setSubmitting(true);
    setError("Withdrawal API not yet implemented. UI ready for backend integration.");
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center bg-white text-slate-700">Loading wallet...</div>;
  }

  const guideSteps = [
    {
      title: "Choose your bank",
      description: "Select the bank where you want to receive the funds.",
    },
    {
      title: "Enter account details",
      description: "Provide your bank account number and account holder name.",
    },
    {
      title: "Set the amount",
      description: `Enter the withdrawal amount. A fee of ${formatCurrency(fee)} applies.`,
    },
    {
      title: "Confirm and submit",
      description: "Review the details and confirm to process your withdrawal.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#ededed] grayscale lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden">
      <main className="min-w-0 flex-1 bg-white px-4 py-4 sm:px-6 sm:py-5 lg:min-h-0 lg:overflow-hidden lg:py-4">
        <div className="mx-auto grid h-full w-full max-w-[1400px] gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(540px,1.12fr)] lg:items-center lg:gap-10 xl:gap-14">
          <section className="min-w-0 lg:flex lg:flex-col lg:py-1">
            <div className="mb-6 flex items-center gap-3 lg:mb-5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="rounded-full text-slate-600 hover:text-[#0e2a5c]"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Wallet</p>
                <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Withdraw to bank</h1>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#0e2a5c]">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Transfer to your bank account</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Choose a bank, enter account details, and set the withdrawal amount.</p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 lg:mt-7">
                <h2 className="text-sm font-semibold text-slate-800">How withdrawal works</h2>
                <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {guideSteps.map((step, index) => (
                    <li key={step.title} className="flex gap-3 text-sm leading-5 text-slate-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{index + 1}</span>
                      <span>{step.description}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3.5 lg:mt-7">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Important information</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-600">The withdrawal amount must be between {formatCurrency(MINIMUM_WITHDRAWAL)} and {formatCurrency(MAXIMUM_WITHDRAWAL)}. A fee of {formatCurrency(fee)} applies to all withdrawals.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 lg:mt-7">
                <h2 className="text-sm font-semibold text-slate-800">Frequently asked questions</h2>
                <div className="mt-2 divide-y divide-slate-200">
                  <details className="group py-3">
                    <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-slate-700 marker:content-none">How long does withdrawal take?<span className="float-right -mr-6 text-slate-400 transition-transform group-open:rotate-45">+</span></summary>
                    <p className="pt-2 text-sm leading-5 text-slate-600">Withdrawals are typically processed within 1-2 business days after approval.</p>
                  </details>
                  <details className="group py-3">
                    <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-slate-700 marker:content-none">Can I cancel a withdrawal?<span className="float-right -mr-6 text-slate-400 transition-transform group-open:rotate-45">+</span></summary>
                    <p className="pt-2 text-sm leading-5 text-slate-600">Once submitted, withdrawals cannot be cancelled. Make sure to verify all details before confirming.</p>
                  </details>
                </div>
              </div>
            </div>
          </section>

          <section className="min-w-0 lg:justify-self-end lg:w-full lg:max-w-[680px]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(17,44,100,0.12)]">
              <div className="relative overflow-hidden bg-[#0e2a5c] px-6 pb-16 pt-6 text-white sm:px-8 sm:pt-7 lg:px-6 lg:pb-12 lg:pt-5">
                <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
                <p className="relative text-sm font-medium text-blue-100">Available balance</p>
                <div className="relative mt-1.5 flex items-baseline gap-2 lg:mt-1">
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-3xl">{formatCurrency(wallet?.balance ?? 0)}</p>
                  <p className="text-sm font-medium text-blue-100">{wallet?.currency ?? "IDR"}</p>
                </div>
              </div>

              <div className="relative -mt-9 rounded-t-[28px] bg-white px-5 py-5 sm:px-8 sm:py-6 lg:px-6 lg:py-4">
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      <div><p className="font-semibold">Withdrawal submitted</p><p className="text-sm">Your withdrawal is being processed.</p></div>
                    </div>
                    <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>{formatCurrency(result.amount)}</strong></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Fee</span><strong>{formatCurrency(result.fee)}</strong></div>
                      <div className="flex justify-between gap-4 border-t border-slate-200 pt-3"><span className="text-slate-500">Total debit</span><strong>{formatCurrency(result.amount + result.fee)}</strong></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Reference</span><span className="font-mono text-xs">{result.referenceNumber}</span></div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setResult(null)} className="h-11 w-full rounded-full">Create another withdrawal</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-3.5">
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold text-slate-800 lg:mb-1.5">Bank</legend>
                      <div className="grid gap-2 sm:grid-cols-2 lg:gap-1.5">
                        {banks.map((bank) => (
                          <label key={bank.value} className={`cursor-pointer rounded-xl border p-3 transition lg:p-2.5 ${bankCode === bank.value ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}>
                            <input type="radio" name="bankCode" value={bank.value} checked={bankCode === bank.value} onChange={(event) => setBankCode(event.target.value)} className="sr-only" />
                            <span className="block text-sm font-semibold text-slate-800">{bank.label}</span><span className="mt-0.5 block text-xs leading-4 text-slate-500 lg:leading-3.5">{bank.description}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="account-number" className="mb-2 block text-sm font-semibold text-slate-800 lg:mb-1.5">Account number</label>
                      <Input id="account-number" type="text" inputMode="numeric" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Enter account number" className="h-14 rounded-full bg-white px-5 text-lg font-semibold shadow-none lg:h-12 lg:text-base" />
                    </div>

                    <div>
                      <label htmlFor="account-name" className="mb-2 block text-sm font-semibold text-slate-800 lg:mb-1.5">Account holder name</label>
                      <Input id="account-name" type="text" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Enter account holder name" className="h-14 rounded-full bg-white px-5 text-lg font-semibold shadow-none lg:h-12 lg:text-base" />
                    </div>

                    <div>
                      <label htmlFor="withdrawal-amount" className="mb-2 block text-sm font-semibold text-slate-800 lg:mb-1.5">Withdrawal amount</label>
                      <Input id="withdrawal-amount" type="number" inputMode="numeric" min={MINIMUM_WITHDRAWAL} max={MAXIMUM_WITHDRAWAL} step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-14 rounded-full bg-white px-5 text-lg font-semibold shadow-none lg:h-12 lg:text-base" />
                      <p className="mt-2 text-xs text-slate-600 lg:mt-1.5">Min: {formatCurrency(MINIMUM_WITHDRAWAL)} · Max: {formatCurrency(MAXIMUM_WITHDRAWAL)}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-sm lg:p-3">
                      <div className="flex justify-between gap-4 text-slate-600"><span>Amount</span><span className="font-semibold text-slate-800">{formatCurrency(parsedAmount)}</span></div>
                      <div className="mt-2 flex justify-between gap-4 text-slate-600 lg:mt-1.5"><span>Fee</span><span className="font-semibold text-slate-800">{formatCurrency(fee)}</span></div>
                      <div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 lg:mt-2 lg:pt-2"><span className="font-semibold text-slate-800">Total debit</span><span className="text-base font-bold text-slate-900 lg:text-sm">{formatCurrency(totalDebit)}</span></div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-slate-300 lg:p-2.5">
                      <input type="checkbox" checked={confirmation} onChange={(event) => setConfirmation(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2" />
                      <span className="text-sm leading-5 text-slate-700">I confirm the bank account details and withdrawal amount are correct.</span>
                    </label>

                    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 lg:p-2.5 lg:text-xs">{error}</p>}

                    <div className="space-y-2 lg:space-y-1">
                      <Button type="submit" disabled={submitting || !confirmation} className="h-12 w-full rounded-full bg-black text-base hover:bg-slate-800 lg:h-11">{submitting ? "Processing..." : "Confirm withdrawal"}</Button>
                      <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")} className="h-auto w-full rounded-full py-1.5 text-sm text-slate-800 hover:bg-slate-100 lg:py-1">Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
