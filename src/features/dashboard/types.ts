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

export interface TransferResponse {
  id: string;
  referenceNumber: string;
  status: string;
  amount: number | string;
  fee: number | string;
  createdAt: string;
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
