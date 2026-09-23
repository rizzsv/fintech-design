export interface DashboardUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface DashboardWallet {
  balance: string;
  currency: string;
  isFrozen: boolean;
  walletStatus: "ACTIVE" | "FROZEN";
}

export interface KycInfo {
  status: string;
  tier: string;
}

export interface AccountActions {
  canTopUp: boolean;
  canTransfer: boolean;
  canWithdraw: boolean;
}

export interface DashboardAccountOverview {
  isActive: boolean;
  isEmailVerified: boolean;
  kyc: KycInfo;
  actions: AccountActions;
}

export interface MonthlyStatisticsPeriod {
  type: string;
  startDate: string;
  endDate: string;
}

export interface DashboardMonthlyStatistics {
  period: MonthlyStatisticsPeriod;
  totalTopUp: string;
  totalTransfer: string;
  totalWithdrawal: string;
}

export interface CashFlowSeriesItem {
  date: string;
  income: string;
  expense: string;
  net: string;
}

export interface DashboardCashFlow {
  period: string;
  income: string;
  expense: string;
  net: string;
  currency: string;
  series: CashFlowSeriesItem[];
}

export interface LimitDetail {
  limit: string;
  used: string;
  remaining: string;
  percentageUsed: number;
}

export interface DashboardLimits {
  dailyTransfer: LimitDetail;
  monthlyTransfer: LimitDetail;
}

export interface RecentTransaction {
  id: string;
  type: string;
  description: string | null;
  amount: string;
  currency: string;
  direction: "INCOME" | "EXPENSE";
  status: string;
  reference: string | null;
  createdAt: string;
}

export interface PendingActivity {
  id: string;
  type: string;
  description: string | null;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
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

/**
 * Mirrors `GET /transaction/config`. Unlike a withdrawal, the transfer `fee` is
 * charged on top of the amount, so the sender is debited `amount + fee`.
 */
export interface TransferConfig {
  fee: number;
  maxAmount: number;
  dailyLimit: number;
  maxPerMinute: number;
}

export interface TransferResponse {
  id: string;
  referenceNumber: string;
  status: string;
  amount: number | string;
  fee: number | string;
  createdAt: string;
}

export type WithdrawalMethod = "BANK_TRANSFER" | "EWALLET";

/** Mirrors `GET /withdrawal/config` - the backend owns these numbers. */
export interface WithdrawalConfig {
  fee: number;
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  methods: WithdrawalMethod[];
}

export interface CreateWithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
}

/** Mirrors `POST /withdrawal`. `netAmount` is what actually reaches the bank. */
export interface WithdrawalResponse {
  withdrawalId: string;
  referenceNumber: string;
  status: string;
  amount: number;
  fee: number;
  netAmount: number;
}



export type TransactionType = "TOPUP" | "TRANSFER" | "WITHDRAWAL" | "REFUND";

/** Mirrors the `status` values accepted by `GET /transaction`. */
export type TransactionStatus =
  | "CREATED"
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REVERSED";

export interface TransactionQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
}

export interface TransactionItem {
  id: string;
  fromWalletId?: string | null;
  toWalletId: string;
  toEmail?: string | null;
  amount: string | number;
  transactionType: TransactionType;
  status: TransactionStatus;
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

export interface TransactionCounterparty {
  id: string;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface TransactionDetail extends TransactionItem {
  referenceNumber?: string | null;
  fee?: string | number;
  description?: string | null;
  completedAt?: string | null;
  fromWallet?: TransactionCounterparty | null;
  toWallet?: TransactionCounterparty | null;
}

export interface DashboardResponse {
  user: DashboardUser;
  wallet: DashboardWallet;
  accountOverview: DashboardAccountOverview;
  monthlyStatistics: DashboardMonthlyStatistics;
  cashFlow: DashboardCashFlow;
  limits: DashboardLimits;
  recentTransactions: RecentTransaction[];
  pendingActivities: PendingActivity[];
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

/** Mirrors the Prisma `kyc_status` enum. */
export type KycStatus = "PENDING" | "APPROVED" | "VERIFIED" | "REJECTED";

/**
 * Mirrors `POST /kyc/documents`. The response also carries the stored file
 * paths, which the client has no route to read, so they are not declared.
 */
export interface KycDocumentResponse {
  id: string;
  userId: string;
  status: KycStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors `GET`/`PATCH /notifications/preferences`. */
export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
}

export type NotificationChannel = keyof NotificationPreferences;
