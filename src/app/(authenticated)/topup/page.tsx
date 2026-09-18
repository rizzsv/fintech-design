"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardApi } from "@/features/dashboard/api";
import type { TopUpPaymentResponse, WalletResponse } from "@/features/dashboard/types";

const MINIMUM_TOP_UP = 1_000;
const MAXIMUM_TOP_UP = 10_000_000;
const TOP_UP_STEP = 1;

const paymentMethods = [
  { value: "qris", label: "QRIS", description: "Scan and pay with any supported wallet" },
  { value: "gopay", label: "GoPay", description: "Pay directly from your GoPay balance" },
  { value: "bank_transfer", label: "Bank transfer", description: "Use your preferred bank" },
  { value: "shopeepay", label: "ShopeePay", description: "Pay from ShopeePay" },
];

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function TopUpPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [amount, setAmount] = useState(100_000);
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

    dashboardApi
      .getWallet()
      .then(setWallet)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load wallet"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleAmountChange = (value: number) => {
    setAmount(Number.isFinite(value) ? value : 0);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!Number.isInteger(amount) || amount < MINIMUM_TOP_UP || amount > MAXIMUM_TOP_UP) {
      setError(`Amount must be between ${formatCurrency(MINIMUM_TOP_UP)} and ${formatCurrency(MAXIMUM_TOP_UP)}.`);
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
    return <div className="flex flex-1 items-center justify-center bg-white text-slate-700">Loading wallet...</div>;
  }

  const sliderAmount = Math.min(Math.max(amount, MINIMUM_TOP_UP), MAXIMUM_TOP_UP);
  const sliderProgress = ((sliderAmount - MINIMUM_TOP_UP) / (MAXIMUM_TOP_UP - MINIMUM_TOP_UP)) * 100;

  return (
    <div className="flex flex-1 flex-col bg-[#ededed] grayscale">
      <div className="flex w-full flex-1 flex-col bg-white">
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto w-full max-w-3xl pb-8 sm:pb-12">
            <div className="mb-6 flex items-center gap-3">
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
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">Wallet</p>
                <h1 className="text-2xl font-semibold text-slate-800">Top up your balance</h1>
              </div>
            </div>

            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(17,44,100,0.12)]">
              <div className="relative overflow-hidden bg-[#0e2a5c] px-6 pb-24 pt-7 text-white sm:px-10 sm:pt-9">
                <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
                <div className="absolute bottom-0 right-16 h-24 w-64 translate-y-10 rotate-[-12deg] rounded-full bg-white/5" aria-hidden="true" />
                <p className="relative text-sm font-medium text-blue-100">Available balance</p>
                <div className="relative mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">{formatCurrency(wallet?.balance ?? 0)}</p>
                  <p className="text-sm font-medium text-blue-100">{wallet?.currency ?? "IDR"}</p>
                </div>
                <p className="relative mt-4 max-w-md text-sm leading-6 text-blue-100">
                  Add funds securely through Midtrans. Your wallet is credited after the payment gateway confirms settlement.
                </p>
              </div>

              <div className="relative -mt-12 rounded-t-[32px] bg-white px-5 py-7 sm:px-10 sm:py-9">
                {payment ? (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-semibold">Payment created</p>
                        <p className="text-sm">Complete payment before the expiry time.</p>
                      </div>
                    </div>
                    <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>{formatCurrency(payment.amount)}</strong></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Method</span><strong className="uppercase">{payment.paymentMethod.replace("_", " ")}</strong></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Reference</span><button type="button" onClick={copyReference} className="flex items-center gap-2 font-mono text-xs text-sky-700 hover:text-sky-900" title="Copy payment reference">{copied ? "Copied" : payment.referenceNumber}<Copy className="h-4 w-4" /></button></div>
                    </div>
                    {payment.paymentUrl && (
                      <Button asChild className="h-14 w-full rounded-full bg-black text-base hover:bg-slate-800">
                        <a href={payment.paymentUrl} target="_blank" rel="noreferrer">Continue to payment <ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    )}
                    <Button type="button" variant="outline" onClick={() => setPayment(null)} className="h-12 w-full rounded-full">Create another top up</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div>
                      <label htmlFor="topup-amount" className="mb-3 block text-base font-semibold text-slate-800">Enter Amount</label>
                      <Input
                        id="topup-amount"
                        type="number"
                        inputMode="numeric"
                        min={MINIMUM_TOP_UP}
                        max={MAXIMUM_TOP_UP}
                        step={TOP_UP_STEP}
                        value={amount || ""}
                        onChange={(event) => handleAmountChange(event.currentTarget.valueAsNumber)}
                        className="h-16 rounded-full bg-white px-6 text-xl font-semibold shadow-none"
                        aria-describedby="amount-help amount-range"
                      />
                    </div>

                    <div className="pt-3">
                      <div className="relative pt-9">
                        <output
                          htmlFor="topup-amount-slider"
                          className="absolute top-0 -translate-x-1/2 rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-black"
                          style={{ left: `${Math.min(Math.max(sliderProgress, 4), 96)}%` }}
                        >
                          {formatAmount(sliderAmount)}
                        </output>
                        <input
                          id="topup-amount-slider"
                          type="range"
                          min={MINIMUM_TOP_UP}
                          max={MAXIMUM_TOP_UP}
                          step={TOP_UP_STEP}
                          value={sliderAmount}
                          onChange={(event) => handleAmountChange(Number(event.currentTarget.value))}
                          className="topup-slider h-11 w-full cursor-pointer appearance-none bg-transparent"
                          style={{ "--slider-progress": `${sliderProgress}%` } as React.CSSProperties}
                          aria-label="Top up amount"
                        />
                      </div>
                      <div id="amount-range" className="-mt-1 flex justify-between text-sm font-medium text-slate-600">
                        <span>{formatCurrency(MINIMUM_TOP_UP)}</span>
                        <span>{formatCurrency(MAXIMUM_TOP_UP)}</span>
                      </div>
                      <p id="amount-help" className="mx-auto mt-7 max-w-sm text-center text-sm leading-6 text-slate-600">
                        Enter an amount or move the slider to set your deposit amount.
                      </p>
                    </div>

                    <fieldset>
                      <legend className="mb-3 text-base font-semibold text-slate-800">Payment method</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {paymentMethods.map((method) => (
                          <label key={method.value} className={`cursor-pointer rounded-2xl border p-4 transition ${paymentMethod === method.value ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}>
                            <input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={(event) => setPaymentMethod(event.target.value)} className="sr-only" />
                            <span className="block text-sm font-semibold text-slate-800">{method.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">{method.description}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                    <div className="space-y-4">
                      <Button type="submit" disabled={submitting} className="h-16 w-full rounded-full bg-black text-base hover:bg-slate-800">
                        {submitting ? "Creating payment..." : "Continue"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")} className="h-auto w-full rounded-full py-2 text-base text-slate-800 hover:bg-slate-100">Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
      <style jsx>{`
        .topup-slider {
          --slider-track: #d8e2dc;
          --slider-fill: #1e7a48;
        }

        .topup-slider::-webkit-slider-runnable-track {
          height: 0.625rem;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            var(--slider-fill) 0 var(--slider-progress),
            var(--slider-track) var(--slider-progress) 100%
          );
        }

        .topup-slider::-webkit-slider-thumb {
          width: 2.5rem;
          height: 2.5rem;
          margin-top: -0.9375rem;
          appearance: none;
          border: 4px solid #ffffff;
          border-radius: 9999px;
          background: #000000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
        }

        .topup-slider::-moz-range-track {
          height: 0.625rem;
          border-radius: 9999px;
          background: var(--slider-track);
        }

        .topup-slider::-moz-range-progress {
          height: 0.625rem;
          border-radius: 9999px;
          background: var(--slider-fill);
        }

        .topup-slider::-moz-range-thumb {
          width: 2rem;
          height: 2rem;
          border: 4px solid #ffffff;
          border-radius: 9999px;
          background: #000000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
        }

        .topup-slider:focus-visible {
          outline: none;
        }

        .topup-slider:focus-visible::-webkit-slider-thumb,
        .topup-slider:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(30, 122, 72, 0.25), 0 2px 8px rgba(0, 0, 0, 0.22);
        }
      `}</style>
    </div>
  );
}
