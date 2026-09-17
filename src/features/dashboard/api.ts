import { API_BASE_URL } from "@/api/client";
import type {
  TopUpPaymentResponse,
  TransactionDetail,
  TransactionQuery,
  TransactionsResponse,
  TransferResponse,
  WalletResponse,
} from "./types";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
  };
}

function transactionQueryPath(query: TransactionQuery = {}) {
  const parameters = new URLSearchParams();

  if (query.page !== undefined) parameters.set("page", String(query.page));
  if (query.limit !== undefined) parameters.set("limit", String(query.limit));
  if (query.search) parameters.set("search", query.search);
  if (query.type) parameters.set("type", query.type);
  if (query.status) parameters.set("status", query.status);

  const hasFilters = Boolean(query.search || query.type || query.status);
  const path = hasFilters ? "/transaction" : "/transactions";
  const search = parameters.toString();

  return `${path}${search ? `?${search}` : ""}`;
}

export const dashboardApi = {
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch profile");

    return payload.data;
  },

  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch dashboard");

    return payload.data;
  },

  getWallet: async (): Promise<WalletResponse> => {
    const response = await fetch(`${API_BASE_URL}/wallet`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch wallet");

    return payload.data;
  },

  getTransactions: async (query: TransactionQuery = {}): Promise<TransactionsResponse> => {
    const response = await fetch(`${API_BASE_URL}${transactionQueryPath(query)}`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch transactions");

    return payload.data;
  },

  createTopUp: async (amount: number, paymentMethod: string): Promise<TopUpPaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payment/topup`, {
      method: "POST",
      headers: { ...authHeaders(), "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ amount, paymentMethod }),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to create top up payment");

    return payload.data;
  },

  createTransfer: async (toWalletId: string, amount: number, description?: string): Promise<TransferResponse> => {
    const response = await fetch(`${API_BASE_URL}/transaction/transfer`, {
      method: "POST",
      headers: { ...authHeaders(), "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ toWalletId, amount, description }),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to create transfer");

    return payload.data;
  },

  getTransactionDetail: async (transactionId: string): Promise<TransactionDetail> => {
    const response = await fetch(`${API_BASE_URL}/transaction/${transactionId}`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch transaction detail");

    return payload.data;
  },
};
