import { API_BASE_URL } from "@/api/client";
import type { TopUpPaymentResponse, TransactionDetail, TransactionsResponse, TransferResponse, WalletResponse } from "./types";

export const dashboardApi = {
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
      },
    });
    
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to fetch profile");
    }

    return payload.data;
  },

  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to fetch dashboard");
    }

    return payload.data;
  },

  getWallet: async (): Promise<WalletResponse> => {
    const response = await fetch(`${API_BASE_URL}/wallet`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to fetch wallet");
    }

    return payload.data;
  },

  getTransactions: async (): Promise<TransactionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/transaction`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to fetch transactions");
    }

    return payload.data;
  },

  createTopUp: async (amount: number, paymentMethod: string): Promise<TopUpPaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payment/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ amount, paymentMethod }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to create top up payment");
    }

    return payload.data;
  },

  createTransfer: async (toWalletId: string, amount: number, description?: string): Promise<TransferResponse> => {
    const response = await fetch(`${API_BASE_URL}/transaction/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ toWalletId, amount, description }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to create transfer");
    }

    return payload.data;
  },

  getTransactionDetail: async (transactionId: string): Promise<TransactionDetail> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to fetch transaction detail");
    }

    return payload.data;
  },
};
