"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Info, WalletCards } from "lucide-react";

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
                <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Top up your balance</h1>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#0e2a5c]">
                  <WalletCards className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Add funds with confidence</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Choose an amount and a payment method, then continue to create your payment.</p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 lg:mt-7">
                <h2 className="text-sm font-semibold text-slate-800">How top up works</h2>
                <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {[
                    "Enter the amount you want to add.",
                    "Select one of the available payment methods.",
                    "Continue to create your payment.",
                    "Your balance is credited after payment settlement is confirmed.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-5 text-slate-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3.5 lg:mt-7">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Important information</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-600">The amount must be between {formatCurrency(MINIMUM_TOP_UP)} and {formatCurrency(MAXIMUM_TOP_UP)}.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 lg:mt-7">
                <h2 className="text-sm font-semibold text-slate-800">Frequently asked questions</h2>
                <div className="mt-2 divide-y divide-slate-200">
                  <details className="group py-3">
                    <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-slate-700 marker:content-none">Which payment methods are available?<span className="float-right -mr-6 text-slate-400 transition-transform group-open:rotate-45">+</span></summary>
                    <p className="pt-2 text-sm leading-5 text-slate-600">The methods shown in the payment form are currently available for this top up.</p>
                  </details>
                  <details className="group py-3">
                    <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-slate-700 marker:content-none">What happens if a payment cannot be created?<span className="float-right -mr-6 text-slate-400 transition-transform group-open:rotate-45">+</span></summary>
                    <p className="pt-2 text-sm leading-5 text-slate-600">We show an error in the form so you can review the amount or payment method and try again.</p>
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
                {payment ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      <div><p className="font-semibold">Payment created</p><p className="text-sm">Complete payment before the expiry time.</p></div>
                    </div>
                    <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>{formatCurrency(payment.amount)}</strong></div>
                      <div className="flex justify-between gap-4"><span className="text-slate-500">Method</span><strong className="uppercase">{payment.paymentMethod.replace("_", " ")}</strong></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Reference</span><button type="button" onClick={copyReference} className="flex items-center gap-2 font-mono text-xs text-sky-700 hover:text-sky-900" title="Copy payment reference">{copied ? "Copied" : payment.referenceNumber}<Copy className="h-4 w-4" /></button></div>
                    </div>
                    {payment.paymentUrl && <Button asChild className="h-12 w-full rounded-full bg-black text-base hover:bg-slate-800"><a href={payment.paymentUrl} target="_blank" rel="noreferrer">Continue to payment <ExternalLink className="h-4 w-4" /></a></Button>}
                    <Button type="button" variant="outline" onClick={() => setPayment(null)} className="h-11 w-full rounded-full">Create another top up</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-3.5">
                    <div>
                      <label htmlFor="topup-amount" className="mb-2 block text-sm font-semibold text-slate-800 lg:mb-1.5">Enter amount</label>
                      <Input id="topup-amount" type="number" inputMode="numeric" min={MINIMUM_TOP_UP} max={MAXIMUM_TOP_UP} step={TOP_UP_STEP} value={amount || ""} onChange={(event) => handleAmountChange(event.currentTarget.valueAsNumber)} className="h-14 rounded-full bg-white px-5 text-lg font-semibold shadow-none lg:h-12 lg:text-base" aria-describedby="amount-help amount-range" />
                    </div>
                    <div className="pt-1 lg:pt-0">
                      <div className="relative pt-8 lg:pt-7">
                        <output htmlFor="topup-amount-slider" className="absolute top-0 -translate-x-1/2 rounded-lg bg-black px-2.5 py-1 text-xs font-semibold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[5px] after:border-t-[5px] after:border-x-transparent after:border-t-black" style={{ left: `${Math.min(Math.max(sliderProgress, 4), 96)}%` }}>{formatAmount(sliderAmount)}</output>
                        <input id="topup-amount-slider" type="range" min={MINIMUM_TOP_UP} max={MAXIMUM_TOP_UP} step={TOP_UP_STEP} value={sliderAmount} onChange={(event) => handleAmountChange(Number(event.currentTarget.value))} className="topup-slider h-9 w-full cursor-pointer appearance-none bg-transparent lg:h-8" style={{ "--slider-progress": `${sliderProgress}%` } as React.CSSProperties} aria-label="Top up amount" />
                      </div>
                      <div id="amount-range" className="-mt-1 flex justify-between text-xs font-medium text-slate-600"><span>{formatCurrency(MINIMUM_TOP_UP)}</span><span>{formatCurrency(MAXIMUM_TOP_UP)}</span></div>
                      <p id="amount-help" className="mt-3 text-center text-xs leading-5 text-slate-600 lg:mt-2 lg:leading-4">Enter an amount or move the slider to set your deposit amount.</p>
                    </div>
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold text-slate-800 lg:mb-1.5">Payment method</legend>
                      <div className="grid gap-2 sm:grid-cols-2 lg:gap-1.5">
                        {paymentMethods.map((method) => (
                          <label key={method.value} className={`cursor-pointer rounded-xl border p-3 transition lg:p-2.5 ${paymentMethod === method.value ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}>
                            <input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={(event) => setPaymentMethod(event.target.value)} className="sr-only" />
                            <span className="block text-sm font-semibold text-slate-800">{method.label}</span><span className="mt-0.5 block text-xs leading-4 text-slate-500 lg:leading-3.5">{method.description}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 lg:p-2.5 lg:text-xs">{error}</p>}
                    <div className="space-y-2 lg:space-y-1"><Button type="submit" disabled={submitting} className="h-12 w-full rounded-full bg-black text-base hover:bg-slate-800 lg:h-11">{submitting ? "Creating payment..." : "Continue"}</Button><Button type="button" variant="ghost" onClick={() => router.push("/dashboard")} className="h-auto w-full rounded-full py-1.5 text-sm text-slate-800 hover:bg-slate-100 lg:py-1">Cancel</Button></div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <style jsx>{`
        .topup-slider { --slider-track: #d8e2dc; --slider-fill: #1e7a48; }
        .topup-slider::-webkit-slider-runnable-track { height: 0.5rem; border-radius: 9999px; background: linear-gradient(to right, var(--slider-fill) 0 var(--slider-progress), var(--slider-track) var(--slider-progress) 100%); }
        .topup-slider::-webkit-slider-thumb { width: 2rem; height: 2rem; margin-top: -0.75rem; appearance: none; border: 3px solid #ffffff; border-radius: 9999px; background: #000000; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22); }
        .topup-slider::-moz-range-track { height: 0.5rem; border-radius: 9999px; background: var(--slider-track); }
        .topup-slider::-moz-range-progress { height: 0.5rem; border-radius: 9999px; background: var(--slider-fill); }
        .topup-slider::-moz-range-thumb { width: 1.75rem; height: 1.75rem; border: 3px solid #ffffff; border-radius: 9999px; background: #000000; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22); }
        .topup-slider:focus-visible { outline: none; }
        .topup-slider:focus-visible::-webkit-slider-thumb, .topup-slider:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 4px rgba(30, 122, 72, 0.25), 0 2px 8px rgba(0, 0, 0, 0.22); }
      `}</style>
    </div>
  );
}
