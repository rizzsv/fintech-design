# Dashboard Frontend Redesign Specification

## 1. Objective

Redesign the fintech dashboard frontend into a clean, modern, card-based financial dashboard.

The visual direction should follow the provided reference image:

- White or very light background
- Rounded cards
- Thin neutral borders
- Clear spacing and hierarchy
- Strong typography for financial values
- Small status badges for positive/negative changes
- Responsive grid layout
- Minimal, professional fintech/SaaS appearance

The reference image is available at:

```text
docs/assets/dashboard-reference.png
```

The reference is a visual direction only. Do not copy unrelated business metrics from the image, such as revenue, subscriptions, churn, enterprise adoption, or response time. Replace them with actual fintech dashboard data from the existing API.

---

## 2. Main Data Source

Use the existing dashboard endpoint:

```http
GET /api/v1/dashboard
```

Authentication:

```http
Authorization: Bearer <access_token>
```

The frontend must use the authenticated user's dashboard data.

Do not use hardcoded financial values or fake transactions.

Before implementation, inspect:

- Existing API client
- Authentication/token handling
- Existing dashboard API response
- Existing TypeScript types/interfaces
- Existing frontend routing
- Existing component and styling conventions
- Existing chart library, if any

If the actual response differs from the expected structure, adapt the frontend to the real response instead of inventing backend fields.

---

## 3. Page Layout

The dashboard should be organized into these sections:

1. Page header
2. Main wallet balance card
3. Account status overview
4. Monthly financial summary cards
5. Cash flow chart
6. Transfer limits card
7. Recent transactions table/list

Use a responsive grid.

Suggested desktop layout:

```text
---------------------------------------------------------
| Header: Welcome / Search / Notifications / Profile    |
---------------------------------------------------------
| Wallet Balance Card                  | Account Status  |
|                                     | Overview        |
---------------------------------------------------------
| Monthly Top Up | Transfer | Withdrawal | Optional KPI |
---------------------------------------------------------
| Cash Flow Chart                     | Transfer Limits |
|                                     |                 |
---------------------------------------------------------
| Recent Transactions                                  |
---------------------------------------------------------
```

The exact layout can be adjusted based on the existing frontend design system.

---

## 4. Page Header

Display:

- Welcome message
- User's first name when available
- Email as fallback when the name is unavailable
- Transaction search action or search input
- Notification shortcut
- Profile shortcut

Example:

```text
Welcome back, Rizq
Here is your financial overview.
```

Do not expose sensitive user fields.

---

## 5. Wallet Balance Card

Create a visually prominent card containing:

- Current wallet balance
- Currency
- Wallet status
- Top Up button
- Transfer button

Example conceptual data:

```json
{
  "balance": "1500000.00",
  "currency": "IDR",
  "isActive": true
}
```

Requirements:

- Format monetary values consistently.
- Treat money values as decimal strings from the API.
- Do not use JavaScript floating-point arithmetic for financial calculations.
- Top Up and Transfer buttons should navigate to their existing flows.
- The dashboard endpoint must not be called to mutate balance.
- If the wallet is unavailable, show a clear empty or unavailable state.

---

## 6. Account Status Overview

Display separate status items for:

- Account status
- Wallet status
- Email verification
- KYC status
- KYC tier

Use visual status badges such as:

- Active
- Inactive
- Verified
- Pending
- Rejected
- Basic
- Verified tier

If the user has not completed email verification or KYC, show a clear call to action.

Examples:

- Verify email
- Complete identity verification
- View verification status

Do not infer verification status from login success.

---

## 7. Monthly Financial Summary

Display cards for the current month:

- Total Top Up
- Total Transfer
- Total Withdrawal

Expected conceptual structure:

```json
{
  "monthlySummary": {
    "period": "2026-09",
    "topUp": "5000000.00",
    "transfer": "1250000.00",
    "withdrawal": "750000.00"
  }
}
```

Requirements:

- Use actual API values.
- Display the active period.
- Format currency consistently.
- Do not display unrelated SaaS metrics from the reference image.
- If a value is missing, handle it explicitly instead of silently displaying misleading data.

Avoid fake percentage changes unless the API provides a valid comparison period.

---

## 8. Cash Flow Chart

Create a cash flow chart based on actual dashboard cash flow data.

Supported periods:

- `7D`
- `30D`
- `3M`

Expected endpoint:

```http
GET /api/v1/dashboard/cash-flow?period=7D
```

Conceptual response:

```json
{
  "period": "7D",
  "currency": "IDR",
  "data": [
    {
      "date": "2026-09-09",
      "inflow": "500000.00",
      "outflow": "100000.00",
      "net": "400000.00"
    }
  ]
}
```

Requirements:

- Add a period selector for `7D`, `30D`, and `3M`.
- Show inflow and outflow clearly.
- Use a line, area, or bar chart consistent with the existing frontend stack.
- Do not invent chart data.
- Show a loading state while fetching.
- Show an empty state when no cash flow exists.
- Show an error state when the request fails.
- Ensure chart labels remain readable on mobile.
- Avoid floating-point calculations for money. Prefer values already calculated by the backend.

If the cash-flow endpoint does not yet exist, do not silently fabricate data. Clearly identify the missing endpoint and use a temporary explicit unavailable state.

---

## 9. Transfer Limits

Display:

- Daily limit
- Daily used
- Daily remaining
- Monthly limit
- Monthly used
- Monthly remaining

Use progress bars or compact visual indicators.

Conceptual structure:

```json
{
  "daily": {
    "limit": "10000000.00",
    "used": "1500000.00",
    "remaining": "8500000.00"
  },
  "monthly": {
    "limit": "50000000.00",
    "used": "7500000.00",
    "remaining": "42500000.00"
  }
}
```

Requirements:

- Use actual limit values from the API.
- Do not default available limits to zero without checking the response mapping.
- Do not calculate financial values using unsafe floating-point arithmetic.
- Remaining amount must be displayed consistently with backend rules.
- The frontend must not independently redefine transfer-limit business rules.

---

## 10. Recent Transactions

Display the latest transactions in a table or responsive list.

Show, where available:

- Transaction date
- Transaction type
- Description
- Amount
- Direction
- Status

Requirements:

- Use the existing transaction identifiers and enum values.
- Sort order should follow the backend response.
- Display positive and negative directions clearly.
- Format status with badges.
- Add a `View All` action linked to transaction history.
- If the list is empty, show an informative empty state.
- Do not expose internal or sensitive fields.

Example conceptual item:

```json
{
  "id": "transaction-id",
  "type": "TRANSFER",
  "direction": "OUT",
  "amount": "250000.00",
  "currency": "IDR",
  "status": "SUCCESS",
  "description": "Transfer to another user",
  "createdAt": "2026-09-15T08:30:00.000Z"
}
```

---

## 11. UI States

Every data-driven section must support:

### Loading

Use skeleton cards, skeleton rows, or a suitable loading indicator.

### Success

Render the actual API data.

### Empty

Show a clear message and, where useful, a relevant action.

Examples:

- No transactions yet
- No cash flow data for this period
- Wallet data is unavailable

### Error

Show a non-technical error message and a retry action where appropriate.

Do not expose stack traces, raw database errors, tokens, or internal server details.

---

## 12. Responsive Behavior

The dashboard must work on:

- Desktop
- Tablet
- Mobile

Requirements:

- Cards should stack naturally on smaller screens.
- Tables should become scrollable lists or responsive cards.
- Buttons must remain usable on touch screens.
- Chart labels must not overlap.
- Avoid fixed widths that cause horizontal page overflow.
- Preserve readable spacing and hierarchy.

---

## 13. Component Structure

Use reusable components where appropriate.

Suggested structure:

```text
DashboardPage
├── DashboardHeader
├── WalletBalanceCard
├── AccountOverviewCard
├── MonthlySummaryGrid
│   ├── SummaryCard
│   └── SummaryCard
├── CashFlowCard
├── TransferLimitsCard
└── RecentTransactionsCard
```

Follow the existing frontend framework and project conventions. Do not introduce a new UI library or state-management library unless the project already uses it or the change is justified.

---

## 14. Data and Security Rules

- Use the authenticated user's data only.
- Never place access tokens in rendered UI.
- Never render password hashes, verification tokens, KYC file paths, selfie paths, or internal database fields.
- Do not trust a `userId` supplied by the browser to select dashboard data.
- Keep API calls in the existing API/service layer.
- Keep presentation logic inside components or view-model mappers.
- Do not duplicate backend business rules in the frontend.
- Do not use mock financial data in the finished implementation.

---

## 15. Acceptance Criteria

The redesign is complete when:

- The dashboard visually follows the supplied card-based reference direction.
- The frontend uses the real dashboard endpoint.
- Wallet balance and currency are accurate.
- Account, wallet, email, and KYC statuses are displayed correctly.
- Monthly top-up, transfer, and withdrawal totals use real API data.
- Cash flow supports `7D`, `30D`, and `3M`, or clearly reports a missing backend capability.
- Transfer limits display actual values and are not incorrectly mapped to zero.
- Recent transactions are rendered correctly.
- Loading, empty, and error states exist.
- The page is responsive.
- No sensitive fields are rendered.
- No hardcoded financial values remain.
- Existing frontend conventions are preserved.
- Existing routes and authentication behavior are not broken.
