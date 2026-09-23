"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type {
  TransactionDetail,
  TransactionItem,
  TransactionsResponse,
  TransactionStatus,
  TransactionType,
  WalletResponse,
} from "@/features/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const PAGE_SIZE = 10;
const transactionTypes: Array<{ value: TransactionType | ""; label: string }> = [
  { value: "", label: "Semua" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "TOPUP", label: "Top Up" },
  { value: "WITHDRAWAL", label: "Withdraw" },
  { value: "REFUND", label: "Refund" },
];

/** Every status `GET /transaction` accepts, so the filter can reach all of them. */
const statusLabels: Record<TransactionStatus, string> = {
  CREATED: "Dibuat",
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  SUCCESS: "Berhasil",
  FAILED: "Gagal",
  CANCELLED: "Dibatalkan",
  REVERSED: "Dikembalikan",
};

const transactionStatuses: Array<{ value: TransactionStatus | ""; label: string }> = [
  { value: "", label: "Semua Status" },
  ...(Object.keys(statusLabels) as TransactionStatus[]).map((value) => ({
    value,
    label: statusLabels[value],
  })),
];

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

function transactionLabel(type: TransactionType, incoming: boolean) {
  const labels: Record<TransactionType, string> = {
    TOPUP: "Top Up",
    TRANSFER: "Transfer",
    WITHDRAWAL: "Withdraw",
    REFUND: "Refund",
  };

  return type === "TRANSFER" ? `${labels[type]} ${incoming ? "Masuk" : "Keluar"}` : labels[type];
}

function statusLabel(status: TransactionStatus) {
  return statusLabels[status] ?? status;
}

/**
 * Only SUCCESS is settled; the terminal failure states read as failures and
 * everything else is still in flight.
 */
function statusDotClass(status: TransactionStatus) {
  if (status === "SUCCESS") return "bg-emerald-500";
  if (status === "FAILED" || status === "CANCELLED" || status === "REVERSED") return "bg-rose-500";
  return "bg-amber-500";
}

function TransactionSkeleton() {
  return (
    <div className="space-y-2" aria-label="Memuat transaksi" aria-busy="true">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-2.5 w-40 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="ml-auto h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="ml-auto h-2.5 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalysisPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pagination, setPagination] = useState<TransactionsResponse["pagination"] | null>(null);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TransactionType | "">("");
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const skipNextListLoad = useRef(false);

  const loadTransactions = useCallback(async (currentPage: number, currentSearch: string, currentType: TransactionType | "", currentStatus: TransactionStatus | "") => {
    const response = await dashboardApi.getTransactions({
      page: currentPage,
      limit: PAGE_SIZE,
      search: currentSearch || undefined,
      type: currentType || undefined,
      status: currentStatus || undefined,
    });
    setTransactions(response.items);
    setPagination(response.pagination);
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        skipNextListLoad.current = true;
        const [, walletResponse] = await Promise.all([
          loadTransactions(1, "", "", ""),
          dashboardApi.getWallet(),
        ]);
        if (active) setWallet(walletResponse);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load account mutations");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInitialData();
    return () => {
      active = false;
    };
  }, [loadTransactions]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (loading) return;
    if (skipNextListLoad.current) {
      skipNextListLoad.current = false;
      return;
    }

    let active = true;
    const loadFilteredTransactions = async () => {
      setListLoading(true);
      setError("");

      try {
        await loadTransactions(page, search, type, status);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load account mutations");
      } finally {
        if (active) setListLoading(false);
      }
    };

    void loadFilteredTransactions();
    return () => {
      active = false;
    };
  }, [loadTransactions, loading, page, search, status, type]);

  const summary = useMemo(() => {
    const successful = transactions.filter((item) => item.status === "SUCCESS");
    const isIncoming = (item: TransactionItem) => item.transactionType === "TOPUP" || item.toWalletId === wallet?.id;
    const incoming = successful.filter(isIncoming).reduce((total, item) => total + (Number(item.amount) || 0), 0);
    const outgoing = successful.filter((item) => !isIncoming(item)).reduce((total, item) => total + (Number(item.amount) || 0), 0);

    return { incoming, outgoing, count: successful.length };
  }, [transactions, wallet?.id]);

  const hasFilters = Boolean(search || type || status);
  const rangeStart = pagination?.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination?.total ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  const retry = () => {
    setError("");
    if (loading) return;
    setListLoading(true);
    loadTransactions(page, search, type, status)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load account mutations"))
      .finally(() => setListLoading(false));
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setType("");
    setStatus("");
    setPage(1);
  };

  const openTransactionDetail = async (transactionId: string) => {
    setSelectedTransaction(null);
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

  const closeDetail = () => {
    setSelectedTransaction(null);
    setDetailError("");
    setDetailLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col bg-[#ededed]">
      <div className="flex w-full flex-1 flex-col bg-white">
        <main className="min-w-0 flex-1 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="w-full space-y-6">
            <header>
              <p className="text-sm font-semibold text-slate-600">Financial overview</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Mutasi Rekening</h1>
              <p className="mt-2 text-sm text-slate-500">Pantau seluruh aktivitas yang masuk dan keluar dari wallet Anda.</p>
            </header>

            <section className="grid grid-cols-1 gap-4 border border-slate-100 bg-white p-4 sm:grid-cols-3" aria-label="Ringkasan transaksi">
              {[
                ["Total Transaksi", loading ? null : String(summary.count), "Transaksi sukses pada halaman ini", "bg-slate-100 text-slate-600"],
                ["Total Dana Masuk", loading ? null : formatCurrency(summary.incoming), "Dana sukses masuk pada halaman ini", "bg-slate-100 text-slate-600"],
                ["Total Dana Keluar", loading ? null : formatCurrency(summary.outgoing), "Dana sukses keluar pada halaman ini", "bg-slate-100 text-slate-600"],
              ].map(([label, value, description, iconClass]) => (
                <div key={String(label)} className="flex min-h-28 flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-5 w-5 rounded-full ${iconClass}`} aria-hidden="true" />
                    <p className="text-xs font-medium uppercase text-slate-700">{label}</p>
                  </div>
                  {value === null ? <div className="h-7 w-32 animate-pulse rounded bg-slate-100" /> : <p className="text-lg font-bold text-slate-900">{value}</p>}
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              ))}
            </section>

        <Card className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <CardHeader className="gap-5 p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Aktivitas transaksi</h2>
                <p className="mt-1 text-sm text-slate-500">Data dari endpoint transaksi rekening Anda</p>
              </div>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">IDR</Badge>
            </div>
            <Separator className="text-slate-200" />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search transaksi..." className="h-10 bg-slate-50 pl-9" aria-label="Search transaksi" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <select value={type} onChange={(event) => { setPage(1); setType(event.target.value as TransactionType | ""); }} className="h-10 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" aria-label="Filter tipe transaksi">
                  {transactionTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value as TransactionStatus | ""); }} className="h-10 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" aria-label="Filter status transaksi">
                  {transactionStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {hasFilters && <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 h-10 text-slate-600 sm:col-auto"><RotateCcw className="h-4 w-4" /> Reset</Button>}
              </div>
            </div>
          </CardHeader>

          <Separator className="text-slate-200" />
          <CardContent className="p-3 sm:p-5 md:p-6">
            {loading || listLoading ? <TransactionSkeleton /> : error ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-5 text-center">
                <p className="text-sm font-semibold text-red-700">Transaksi tidak dapat dimuat</p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
                <Button type="button" variant="outline" size="sm" onClick={retry} className="mt-4 border-red-200 bg-white text-red-700"><RotateCcw className="h-4 w-4" /> Coba lagi</Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
                <p className="text-sm font-semibold text-slate-700">Belum ada transaksi</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">{hasFilters ? "Belum ada aktivitas transaksi yang sesuai dengan filter Anda." : "Belum ada aktivitas transaksi pada rekening Anda."}</p>
                {hasFilters && <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="mt-4"><RotateCcw className="h-4 w-4" /> Reset filter</Button>}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {transactions.map((item) => {
                  const incoming = item.transactionType === "TOPUP" || item.toWalletId === wallet?.id;
                  return (
                    <button type="button" key={item.id} onClick={() => openTransactionDetail(item.id)} className="flex w-full items-center justify-between gap-3 px-3 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:bg-sky-50 focus-visible:outline-none sm:gap-5 sm:px-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${incoming ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`} aria-hidden="true">
                          {incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800">{transactionLabel(item.transactionType, incoming)}</span>
                          <span className="mt-1 block truncate text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                        </span>
                      </div>
                      <span className="shrink-0 text-right">
                        <span className={`block text-sm font-semibold tabular-nums ${incoming ? "text-emerald-700" : "text-rose-700"}`}>{incoming ? "+" : "-"}{formatCurrency(item.amount)}</span>
                        <span className="mt-1 flex items-center justify-end gap-1.5 text-xs text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(item.status)}`} aria-hidden="true" />{statusLabel(item.status)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>

          {!loading && !listLoading && !error && pagination && pagination.total > 0 && (
            <>
              <Separator className="text-slate-200" />
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-slate-500">Menampilkan {rangeStart}–{rangeEnd} dari {pagination.total} transaksi</p>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Halaman sebelumnya"><ChevronLeft className="h-4 w-4" /> Sebelumnya</Button>
                  <span className="min-w-20 text-center text-sm font-medium text-slate-600">{pagination.page} / {pagination.totalPages}</span>
                  <Button type="button" variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} aria-label="Halaman berikutnya">Berikutnya <ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
          </Card>
          </div>
        </main>
      </div>

      {(detailLoading || detailError || selectedTransaction) && (
        <div className="fixed inset-0 z-40 flex items-end bg-slate-950/35 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Detail transaksi">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-sky-700">Transaction detail</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Detail Mutasi</h2>
              </div>
              <button type="button" onClick={closeDetail} aria-label="Tutup detail transaksi" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            {detailLoading && <TransactionSkeleton />}
            {detailError && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{detailError}</div>}
            {selectedTransaction && !detailLoading && !detailError && (() => {
              const detailIncoming =
                selectedTransaction.transactionType === "TOPUP" ||
                selectedTransaction.toWalletId === wallet?.id;

              /**
               * For money coming in the other party is the sender, for money
               * going out it is the recipient. A top up has no counterparty
               * wallet, so nothing is shown.
               */
              const counterparty = detailIncoming
                ? selectedTransaction.fromWallet
                : selectedTransaction.toWallet;

              return (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-slate-300">{transactionLabel(selectedTransaction.transactionType, detailIncoming)}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">{formatCurrency(selectedTransaction.amount)}</p>
                  <p className="mt-2 text-xs text-slate-300">{statusLabel(selectedTransaction.status)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Tanggal</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(selectedTransaction.createdAt)}</p></div>
                  <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Tipe transaksi</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedTransaction.transactionType}</p></div>
                </div>
                {counterparty?.user && <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500">{detailIncoming ? "Dari" : "Kepada"}</span><span className="max-w-56 truncate font-medium text-slate-800">{counterparty.user.email}</span></div>}
                {selectedTransaction.fee !== undefined && selectedTransaction.fee !== null && <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500">Fee</span><span className="font-medium text-slate-800">{formatCurrency(selectedTransaction.fee)}</span></div>}
                {selectedTransaction.referenceNumber && <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500">Reference</span><span className="max-w-56 truncate font-medium text-slate-800">{selectedTransaction.referenceNumber}</span></div>}
                {selectedTransaction.description && <div className="flex items-start justify-between gap-4 text-sm"><span className="shrink-0 text-slate-500">Description</span><span className="text-right font-medium text-slate-800">{selectedTransaction.description}</span></div>}
              </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
