import { API_BASE_URL } from "@/api/client";
import type {
  CreateWithdrawalRequest,
  KycDocumentResponse,
  NotificationPreferences,
  TopUpPaymentResponse,
  TransactionDetail,
  TransactionQuery,
  TransactionsResponse,
  TransferConfig,
  TransferResponse,
  WalletResponse,
  WithdrawalConfig,
  WithdrawalResponse,
} from "./types";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
  };
}

/**
 * Multipart requests must not declare a Content-Type - the browser has to set
 * it so the multipart boundary is included.
 */
function authorizationOnlyHeaders() {
  return {
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

  const search = parameters.toString();

  return `/transaction${search ? `?${search}` : ""}`;
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

  getTransferConfig: async (): Promise<TransferConfig> => {
    const response = await fetch(`${API_BASE_URL}/transaction/config`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch transfer config");

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

  getWithdrawalConfig: async (): Promise<WithdrawalConfig> => {
    const response = await fetch(`${API_BASE_URL}/withdrawal/config`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch withdrawal config");

    return payload.data;
  },

  createWithdrawal: async (request: CreateWithdrawalRequest): Promise<WithdrawalResponse> => {
    const response = await fetch(`${API_BASE_URL}/withdrawal`, {
      method: "POST",
      headers: { ...authHeaders(), "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(request),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to create withdrawal");

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

  /**
   * `POST /kyc/documents` accepts exactly two file parts named `document` and
   * `selfie`. The upload middleware allows no text fields, so nothing else may
   * be appended to the form.
   */
  uploadKycDocuments: async (document: File, selfie: File): Promise<KycDocumentResponse> => {
    const form = new FormData();
    form.append("document", document);
    form.append("selfie", selfie);

    const response = await fetch(`${API_BASE_URL}/kyc/documents`, {
      method: "POST",
      headers: authorizationOnlyHeaders(),
      body: form,
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to upload KYC documents");

    return payload.data;
  },

  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: "GET",
      headers: authHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to fetch notification preferences");

    return payload.data;
  },

  updateNotificationPreferences: async (
    patch: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> => {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload?.message || "Failed to update notification preferences");

    return payload.data;
  },
};
