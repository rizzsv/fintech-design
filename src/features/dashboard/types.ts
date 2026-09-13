export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
}

export interface DashboardWallet {
  balance: number;
  currency: string;
}

export interface WalletResponse {
  id: string;
  currency: string;
  balance: string | number;
  version: number;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    kycStatus: string;
    kycTier: string;
  };
}

export interface TopUpPaymentResponse {
  paymentId: string;
  referenceNumber: string;
  provider: string;
  paymentMethod: string;
  amount: number;
  status: string;
  paymentUrl?: string;
  snapToken?: string;
  expiredAt: string;
}

export interface TransferResponse {
  id: string;
  referenceNumber: string;
  status: string;
  amount: number | string;
  fee: number | string;
  createdAt: string;
}

export interface DashboardLimits {
  dailyTransfer: {
    limit: number;
    used: number;
    remaining: number;
  };
  monthlyTransfer: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface DashboardKyc {
  status: string;
  tier: string;
}

export interface DashboardSecurity {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface DashboardTransaction {
  id?: string;
  type?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  description?: string;
  counterparty?: string;
}

export interface TransactionItem {
  id: string;
  fromWalletId?: string | null;
  toWalletId: string;
  toEmail?: string | null;
  amount: string | number;
  transactionType: "TOPUP" | "TRANSFER" | "WITHDRAWAL" | "REFUND";
  status: string;
  createdAt: string;
}

export interface TransactionsResponse {
  items: TransactionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionDetail extends TransactionItem {
  referenceNumber?: string | null;
  fee?: string | number;
  description?: string | null;
  completedAt?: string | null;
  fromWallet?: { id?: string; user?: { email?: string } } | null;
  toWallet?: { id?: string; user?: { email?: string } } | null;
  ledger?: Array<{ entryType?: string; amount?: string | number; balanceAfter?: string | number }>;
  logs?: Array<{ event?: string; createdAt?: string; statusAfter?: string }>;
}

export interface DashboardResponse {
  user: DashboardUser;
  wallet: DashboardWallet;
  limits: DashboardLimits;
  kyc: DashboardKyc;
  security: DashboardSecurity;
  recentTransactions: DashboardTransaction[];
}

export interface MeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  account: {
    isActive: boolean;
    isEmailVerified: boolean;
  };
  kyc: {
    status: string;
    tier: string;
  };
}
