"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardApi } from "@/features/dashboard/api";
import type { TransferResponse, WalletResponse } from "@/features/dashboard/types";

const TRANSFER_FEE = 2500;

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function TransferPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
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

    dashboardApi
      .getWallet()
      .then(setWallet)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load wallet"))
      .finally(() => setLoading(false));
  }, [router]);

  const fee = TRANSFER_FEE;
  const parsedAmount = amount === "" ? 0 : Number(amount);
  const totalDebit = parsedAmount + fee;
  const activeStep = confirmation ? 3 : recipient.trim() ? 2 : 1;

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
    return <div className="flex flex-1 items-center justify-center bg-white text-slate-700">Loading wallet...</div>;
  }

  const guideSteps = [
    {
      title: "Choose a recipient",
      description: "Enter the recipient wallet ID carefully. Transfers are sent to the wallet you specify.",
    },
    {
      title: "Set the amount",
      description: `Enter a whole IDR amount. The existing transfer fee of ${formatCurrency(fee)} is shown before you continue.`,
    },
    {
      title: "Review and confirm",
      description: "Confirm the recipient and total debit, then submit your transfer securely.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#ededed] grayscale lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden">
      <main className="min-w-0 flex-1 bg-white px-4 py-4 sm:px-6 sm:py-5 lg:min-h-0 lg:overflow-hidden lg:py-4">
        <div className="mx-auto grid h-full w-full max-w-[1400px] gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(540px,1.12fr)] lg:items-center lg:gap-10 xl:gap-14">
          <section aria-labelledby="transfer-guide-title" className="min-w-0 max-w-xl lg:flex lg:flex-col lg:py-1">
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
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Payments</p>
                <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Transfer funds</h1>
              </div>
            </div>
            <div>
                <p className="text-sm font-semibold text-violet-600">How it works</p>
                <h2 id="transfer-guide-title" className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#0e2a5c] sm:text-3xl">
                  Send money with clarity at every step.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                  Review the recipient, amount, and total debit before your transfer is submitted.
                </p>

                <ol className="mt-7 space-y-5 sm:mt-8 sm:space-y-6 lg:mt-6 lg:space-y-4">
                  {guideSteps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = activeStep === stepNumber;
                    const isComplete = activeStep > stepNumber;

                    return (
                      <li key={step.title} className={`relative flex gap-4 pl-1 ${isActive ? "" : ""}`}>
                        {index < guideSteps.length - 1 && (
                          <span
                            className={`absolute left-[21px] top-11 h-[calc(100%+1rem)] w-px ${isActive || isComplete ? "bg-violet-500" : "bg-slate-200"}`}
                            aria-hidden="true"
                          />
                        )}
                        <span className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isActive ? "bg-violet-100 text-violet-700 ring-2 ring-violet-500" : isComplete ? "bg-violet-600 text-white" : "bg-slate-100 text-[#0e2a5c]"}`}>
                          {stepNumber}
                        </span>
                        <div className="pt-1">
                          <h3 className="text-lg font-bold text-[#0e2a5c]">{step.title}</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 sm:text-base">{step.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-7 rounded-[24px] bg-[#0e2a5c] p-5 text-white shadow-sm lg:mt-6 lg:p-4">
                  <p className="text-sm font-medium text-blue-100">Available balance</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(wallet?.balance ?? 0)}</p>
                  <p className="mt-2 text-sm leading-5 text-blue-100">The final transfer checks remain in place when you submit.</p>
                </div>
            </div>
          </section>

          <section aria-labelledby="transfer-form-title" className="min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(17,44,100,0.12)] lg:justify-self-end lg:w-full lg:max-w-[680px]">
                <div className="bg-[#0e2a5c] px-6 py-7 text-white sm:px-9 sm:py-8 lg:px-6 lg:py-3">
                  <p className="text-sm font-medium text-blue-100">Secure wallet transfer</p>
                  <h2 id="transfer-form-title" className="mt-1 text-xl font-bold">Send money</h2>
                  <p className="mt-1 text-sm leading-5 text-blue-100">Complete the details below to continue.</p>
                </div>

                <div className="px-5 py-7 sm:px-9 sm:py-9 lg:px-6 lg:py-4">
                  {result ? (
                    <div className="space-y-5">
                      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-semibold">Transfer successful</p>
                          <p className="text-sm">The recipient has been credited.</p>
                        </div>
                      </div>
                      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>{formatCurrency(result.amount)}</strong></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Fee</span><strong>{formatCurrency(result.fee)}</strong></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Reference</span><strong className="font-mono text-xs text-sky-700">{result.referenceNumber}</strong></div>
                      </div>
                      <Button type="button" variant="outline" onClick={() => { setResult(null); setConfirmation(false); }} className="h-12 w-full rounded-full">Make another transfer</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-3.5">
                      <div>
                        <label htmlFor="recipient-wallet" className="mb-2 block text-sm font-semibold text-[#0e2a5c] lg:mb-1.5">Recipient wallet ID</label>
                        <Input
                          id="recipient-wallet"
                          value={recipient}
                          onChange={(event) => { setRecipient(event.target.value); setError(""); }}
                          placeholder="5a044e27-ae12-4bf7-ab37-871a8ec1ad68"
                          className="h-12 rounded-xl bg-white px-4 font-mono text-sm shadow-none"
                          aria-describedby="recipient-help"
                        />
                        <p id="recipient-help" className="mt-2 text-xs leading-5 text-slate-500 lg:mt-1 lg:leading-4">Use the recipient&apos;s wallet ID.</p>
                      </div>

                      <div>
                        <label htmlFor="transfer-amount" className="mb-2 block text-sm font-semibold text-[#0e2a5c] lg:mb-1.5">Amount</label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200">
                          <span className="text-slate-500">Rp</span>
                          <input
                            id="transfer-amount"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={amount}
                            onChange={(event) => {
                              const digitsOnly = event.target.value.replace(/\D/g, "");
                              setAmount(digitsOnly.replace(/^0+(?=\d)/, ""));
                              setError("");
                            }}
                            className="h-12 w-full border-0 bg-transparent px-3 text-base font-semibold text-slate-800 outline-none"
                            aria-describedby="amount-help"
                          />
                        </div>
                        <p id="amount-help" className="mt-2 text-xs leading-5 text-slate-500 lg:mt-1 lg:leading-4">Enter a whole IDR amount. Minimum Rp1.</p>
                      </div>

                      <div>
                        <label htmlFor="transfer-description" className="mb-2 block text-sm font-semibold text-[#0e2a5c] lg:mb-1.5">Description <span className="font-normal text-slate-400">(optional)</span></label>
                        <Input
                          id="transfer-description"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          maxLength={255}
                          placeholder="Lunch, rent, or other note"
                          className="h-12 rounded-xl bg-white px-4 text-sm shadow-none"
                        />
                      </div>

                      <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm lg:space-y-2 lg:p-3">
                        <div className="flex justify-between gap-4 text-slate-600"><span>Transfer amount</span><span>{formatCurrency(amount)}</span></div>
                        <div className="flex justify-between gap-4 text-slate-600"><span>Transfer fee</span><span>{formatCurrency(fee)}</span></div>
                        <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 font-semibold text-[#0e2a5c] lg:pt-2"><span>Total debit</span><span>{formatCurrency(totalDebit)}</span></div>
                      </div>

                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 transition hover:border-slate-300 lg:p-3">
                        <input type="checkbox" checked={confirmation} onChange={(event) => { setConfirmation(event.target.checked); setError(""); }} className="mt-0.5 h-4 w-4 accent-[#0e2a5c]" />
                        <span>I confirm the recipient and amount are correct.</span>
                      </label>

                      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 lg:rounded-xl lg:p-3">{error}</p>}
                      <div className="space-y-2 lg:space-y-1">
                        <Button type="submit" disabled={submitting} className="h-12 w-full rounded-full bg-black text-base hover:bg-slate-800 lg:h-11">
                          <Send className="h-4 w-4" />
                          {submitting ? "Processing transfer..." : "Confirm transfer"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")} className="h-auto w-full rounded-full py-1.5 text-sm text-slate-800 hover:bg-slate-100 lg:py-1">Cancel</Button>
                      </div>
                    </form>
                  )}
                </div>
          </section>
        </div>
      </main>
    </div>
  );
}
