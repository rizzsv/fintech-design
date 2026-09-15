"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  X,
} from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type { TransactionDetail, TransactionItem, WalletResponse } from "@/features/dashboard/types";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function transactionLabel(type: TransactionItem["transactionType"]) {
  if (type === "TOPUP") return "Top Up";
  if (type === "WITHDRAWAL") return "Withdraw";
  if (type === "REFUND") return "Refund";
  return "Transfer";
}

export default function AnalysisPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/");
      return;
    }

    Promise.all([dashboardApi.getTransactions(), dashboardApi.getWallet()])
      .then(([transactionResponse, walletResponse]) => {
        setTransactions(transactionResponse.items);
        setWallet(walletResponse);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load account mutations");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const summary = useMemo(() => {
    const successful = transactions.filter((item) => item.status === "SUCCESS");
    const isIncoming = (item: TransactionItem) =>
      item.transactionType === "TOPUP" || item.toWalletId === wallet?.id;
    const incoming = successful
      .filter(isIncoming)
      .reduce((total, item) => total + (Number(item.amount) || 0), 0);
    const outgoing = successful
      .filter((item) => !isIncoming(item))
      .reduce((total, item) => total + (Number(item.amount) || 0), 0);

    return { incoming, outgoing, count: successful.length };
  }, [transactions, wallet?.id]);

  const openTransactionDetail = async (transactionId: string) => {
    setDetailLoading(true);
    setDetailError("");

    try {
      setSelectedTransaction(await dashboardApi.getTransactionDetail(transactionId));
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Unable to load transaction detail");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ededed] grayscale">
      <div className="min-h-screen w-full bg-white">
        <main className="min-h-screen flex-1 px-4 py-4 sm:px-6 sm:py-5">
          <DashboardTopBar userInitial="U" />
          <header className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="mb-2 text-sm font-medium text-sky-600">Financial overview</p>
              <h1 className="text-3xl font-semibold text-slate-800">Mutasi Rekening</h1>
              <p className="mt-2 text-sm text-slate-500">Pantau seluruh aktivitas uang masuk dan keluar dari wallet Anda.</p>
            </div>
            <button type="button" onClick={() => router.push("/dashboard")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>
          </header>

          {loading && <div className="rounded-[26px] bg-white p-8 text-slate-500 shadow-sm">Loading mutations...</div>}
          {error && <div className="rounded-[26px] border border-red-100 bg-red-50 p-8 text-red-600">{error}</div>}

          {!loading && !error && (
            <>
              <section className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Total mutasi sukses</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-800">{summary.count}</p>
                  <p className="mt-1 text-xs text-slate-400">dari transaksi terbaru</p>
                </div>
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-sm text-emerald-700">Total dana masuk</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-800">{formatCurrency(summary.incoming)}</p>
                  <p className="mt-1 text-xs text-emerald-600">Top Up dan transfer masuk</p>
                </div>
                <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-5 shadow-sm">
                  <p className="text-sm text-rose-700">Total dana keluar</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-800">{formatCurrency(summary.outgoing)}</p>
                  <p className="mt-1 text-xs text-rose-600">Transfer dan withdraw</p>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Aktivitas transaksi</h2>
                    <p className="mt-1 text-sm text-slate-400">Data dari endpoint transaksi rekening Anda</p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">IDR wallet</span>
                </div>

                {transactions.length === 0 && <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">Belum ada mutasi rekening.</div>}
                <div className="space-y-3">
                  {transactions.map((item) => {
                    const incoming = item.transactionType === "TOPUP" || item.toWalletId === wallet?.id;
                    return (
                      <button type="button" key={item.id} onClick={() => openTransactionDetail(item.id)} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-sky-50">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${incoming ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-700">{transactionLabel(item.transactionType)}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">{formatDate(item.createdAt)} · {item.status}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-sm font-bold ${incoming ? "text-emerald-600" : "text-rose-600"}`}>{incoming ? "+" : "-"}{formatCurrency(item.amount)}</p>
                          {item.status === "SUCCESS" && <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Berhasil</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {(detailLoading || detailError || selectedTransaction) && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0e2a5c]/35 p-4" role="dialog" aria-modal="true" aria-label="Transaction detail">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(17,44,100,0.25)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-sky-600">Transaction detail</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-800">Detail Mutasi</h2>
              </div>
              <button type="button" onClick={() => { setSelectedTransaction(null); setDetailError(""); }} aria-label="Close transaction detail" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading && <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Loading transaction detail...</div>}
            {detailError && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{detailError}</div>}
            {selectedTransaction && !detailLoading && !detailError && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#0d2c5f] p-5 text-white">
                  <p className="text-sm text-blue-100">{transactionLabel(selectedTransaction.transactionType)}</p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(selectedTransaction.amount)}</p>
                  <p className="mt-2 text-xs text-blue-100">{selectedTransaction.status}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Tanggal</p><p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(selectedTransaction.createdAt)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Fee</p><p className="mt-1 text-sm font-semibold text-slate-700">{formatCurrency(selectedTransaction.fee ?? 0)}</p></div>
                </div>
                {selectedTransaction.referenceNumber && <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm"><span className="text-slate-400">Reference</span><span className="max-w-[230px] truncate font-medium text-slate-700">{selectedTransaction.referenceNumber}</span></div>}
                {selectedTransaction.description && <div className="flex items-center justify-between text-sm"><span className="text-slate-400">Description</span><span className="font-medium text-slate-700">{selectedTransaction.description}</span></div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
