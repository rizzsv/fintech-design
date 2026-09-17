# PRD — Mutation Page Redesign

## Task

Redesign the existing **Mutasi Rekening / Transaction History page** using the provided visual reference:

`docs/design/mutation-reference.png`

The goal is to improve the page's visual hierarchy, transaction discoverability, filtering experience, and transaction detail presentation while preserving the existing backend contract and application behavior.

This is a FRONTEND-ONLY redesign.

Do not modify backend code, database schema, API implementation, authentication, financial logic, or routing unless explicitly requested later.

---

# 1. FIRST — READ THE REFERENCES

Before writing or modifying any UI code:

1. Read `CLAUDE.md`.
2. Read the existing mutation/transaction page implementation.
3. Read the relevant API/service/types used by the mutation page.
4. Read `docs/design/mutation-reference.png` using the Read tool as an IMAGE.

Do not treat the image path as a string.

The image is the PRIMARY visual reference for this task.

After reading the reference, briefly describe the intended page structure before implementation.

Do not start implementation until the structure has been understood.

---

# 2. DESIGN REFERENCE

Reference:

`docs/design/mutation-reference.png`

The reference is primarily used for:

- overall composition
- visual hierarchy
- card proportions
- spacing
- search/filter placement
- transaction list structure
- typography hierarchy
- border/radius treatment
- subtle background surfaces
- navigation/header relationship
- information density

Do NOT blindly copy the reference's business content.

The reference is from a different product/domain.

Adapt its visual language to the existing fintech application.

The existing fintech application's branding, typography, color system, navigation, and established UI patterns remain authoritative where the reference does not specify them.

Do not introduce unrelated visual styles.

---

# 3. TARGET PAGE STRUCTURE

The redesigned page should follow this hierarchy:

```text
Financial overview

Mutasi Rekening
Pantau seluruh aktivitas yang masuk dan keluar dari wallet Anda.

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total transaksi│ │ Total dana     │ │ Total dana     │
│                │ │ masuk          │ │ keluar         │
│ 9              │ │ Rp 2.040.000   │ │ Rp 3.100.000   │
└────────────────┘ └────────────────┘ └────────────────┘


┌──────────────────────────────────────────────────────────┐
│ Aktivitas transaksi                              [IDR]   │
│ Data dari endpoint transaksi rekening Anda               │
│                                                          │
│ [ Search transaksi... ] [ Semua ] [ Semua Status ]       │
│ [ Date range ]                              [ Filter ]   │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ transaction                                          │ │
│ │ amount                                      status   │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ transaction                                          │ │
│ │ amount                                      status   │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Showing 1–10 of X                    [pagination]        │
└──────────────────────────────────────────────────────────┘

The exact visual implementation should follow the image reference.

4. PAGE HEADER

Keep the existing page context:

Eyebrow:

Financial overview

Title:

Mutasi Rekening

Description:

Pantau seluruh aktivitas yang masuk dan keluar dari wallet Anda.

The header should remain compact and aligned with the application's existing navigation/content container.

Do not unnecessarily redesign the global navigation.

5. SUMMARY SECTION

Create/retain three summary metrics:

Total Transaksi

Displays the number of transactions available for the current transaction context.

Example:

9

Total Dana Masuk

Displays incoming transaction total.

Example:

Rp 2.040.000

Total Dana Keluar

Displays outgoing transaction total.

Example:

Rp 3.100.000

IMPORTANT:

These values MUST come from real backend data.

Do NOT hardcode:

9
Rp 2.040.000
Rp 3.100.000
any other financial number.

If the current backend does not expose a dedicated summary endpoint, inspect the existing API/service implementation before deciding how the UI should derive/display the information.

Do not invent an API endpoint.

If summary data is not currently available, preserve the existing available data and report the limitation instead of introducing fake values.

6. TRANSACTION ACTIVITY SECTION

Main section title:

Aktivitas transaksi

Description:

Data dari endpoint transaksi rekening Anda

Add a currency indicator:

IDR

This should be a small neutral badge/chip rather than a large element.

Use the project's existing shadcn Badge primitive if appropriate.

Do not create unnecessary visual decoration.

7. SEARCH

Add a transaction search input:

Placeholder:

Search transaksi...

Search should use the existing backend search capability.

Existing endpoint:

GET {{base_url}}/transaction?search=rasthy

Do NOT perform client-side filtering over the entire transaction dataset if the backend already supports search.

The frontend should pass the search query to the backend.

Handle:

empty search
loading state
no results
error state
clearing search

Avoid firing a request on every keystroke without consideration.

Use a reasonable debounce if the existing application architecture does not already provide one.

Do not add a dependency solely for debounce.

8. TRANSACTION TYPE FILTER

Provide a transaction type filter.

Existing backend capability:

GET {{base_url}}/transaction?type=TRANSFER

The UI should use the actual supported transaction type values from the backend/types.

Do NOT invent transaction types that the backend does not support.

At minimum, provide:

Semua
Transfer

If the backend currently supports additional types, expose them only when confirmed from the existing code/API types.

The UI label can be human-readable while the request parameter must use the backend's actual enum/value.

9. STATUS FILTER

Provide a status filter.

Existing backend capability:

GET {{base_url}}/transaction?status=SUCCESS

Use the actual status enum from the backend.

Example UI:

Semua Status
SUCCESS
PENDING
FAILED

Only display statuses confirmed by the backend implementation/types.

Do not invent status values.

10. DATE FILTER

Provide a date-range filter visually consistent with the reference.

Possible UI:

30 hari terakhir

or another appropriate existing design-system control.

IMPORTANT:

Do not send date query parameters to the backend unless the existing backend actually supports them.

If date filtering is not currently supported by the API:

the UI must not pretend that it works;
do not implement fake filtering;
do not create a new backend endpoint;
do not modify backend code in this task.

If the existing API already supports date filtering, inspect the exact parameter names and use them.

11. FILTER APPLICATION

The final filter area should feel compact and similar to the reference.

Conceptually:

[ Search transaksi... ]
[ Semua ]
[ Semua Status ]
[ Date range ]
[ Filter ]

The exact responsive arrangement is determined by the reference and existing application layout.

Desktop:

controls should sit in one coherent toolbar where space allows.

Mobile:

controls should wrap or stack cleanly.
no horizontal overflow.
search should have sufficient width.
filter controls should remain usable.

Do not introduce excessive cards around each filter.

12. TRANSACTION LIST

The transaction list is the main content of the page.

Each transaction should clearly communicate:

transaction type
transaction direction
date/time
status
amount

Use the existing API response shape.

Do not assume fields that are not present in the actual response.

Do not expose sensitive information.

Recommended visual hierarchy:

[icon]  Transfer Masuk
        15 Sep 2026 · 23:42

                                      +Rp 1.000.000
                                      ✓ Berhasil

For outgoing:

[icon]  Transfer Keluar
        15 Sep 2026 · 22:50

                                      -Rp 2.000.000
                                      ✓ Berhasil

The actual labels and direction must be derived from real transaction data.

Do not hardcode transaction names, amounts, users, references, or statuses.

13. TRANSACTION DIRECTION

Determine incoming/outgoing direction using the actual transaction data.

The existing backend query identifies transactions using:

fromWalletId
toWalletId

The frontend must not guess direction from arbitrary text.

Use the existing API response/type definitions to determine how direction should be represented.

If the backend does not explicitly return direction, inspect the existing response mapping/service before implementing the UI.

Do not modify backend business logic just to make the UI easier.

14. TRANSACTION STATUS

Use the existing status values.

Map status to the existing design language.

For example:

SUCCESS → Berhasil
PENDING → Menunggu
FAILED  → Gagal

Only use mappings that correspond to actual backend values.

Preserve semantic accessibility.

Do not rely solely on color to communicate status.

Use the existing shadcn Badge primitive where appropriate, while preserving the fintech application's established status colors.

15. TRANSACTION DETAIL

Existing backend endpoint:

GET {{base_url}}/transaction/:id

Example:

GET {{base_url}}/transaction/d217b859-5b7c-410c-a4d8-908664a7b072

Clicking a transaction should open the existing transaction-detail behavior if one already exists.

If there is no existing detail behavior, implement a clean detail interaction using the existing project's established overlay/modal pattern.

Before creating a new Dialog implementation, inspect whether a shadcn Dialog primitive already exists.

Detail should display only safe fields available from the backend.

Possible information:

Transaction
Amount
Status
Date
Transaction type
Reference
Counterparty
Description

Do not expose:

password
token
session data
internal security fields
sensitive database fields

Preserve loading, error, and close behavior.

16. PAGINATION

Existing backend endpoint:

GET {{base_url}}/transactions?page=1&limit=10

The backend expects numeric pagination values.

Frontend query parameters must be sent according to the existing API contract.

Example:

page=1
limit=10

The UI should display pagination based on actual backend metadata.

Do not hardcode:

128
13 pages
1–10

Those values must come from the API response.

If the existing response uses a different pagination metadata structure, adapt to the actual response instead of changing the backend.

Default:

page = 1
limit = 10

Keep the user's current page/filter/search state consistent when appropriate.

17. API ENDPOINT MAPPING

Use the existing API implementation.

Known endpoints:

All transactions
GET {{base_url}}/transaction
Transaction by ID
GET {{base_url}}/transaction/:id
Pagination
GET {{base_url}}/transactions?page=1&limit=10
Transaction type
GET {{base_url}}/transaction?type=TRANSFER
Transaction status
GET {{base_url}}/transaction?status=SUCCESS
Search
GET {{base_url}}/transaction?search=rasthy

IMPORTANT:

There is an inconsistency in the current API documentation:

/transaction
/transactions

Do NOT resolve this by changing backend routes.

Inspect the existing frontend API client/service and backend route definitions first.

Use the actually registered/working endpoint for each operation.

If pagination is currently exposed through /transactions while other filters use /transaction, preserve the existing backend contract.

Do not normalize the routes without explicit approval.

18. DATA INTEGRITY

This is a financial application.

Absolutely NO:

dummy transactions
mock transaction amounts
hardcoded balances
fake statuses
fake pagination totals
placeholder transaction users
generated transaction history
static summary numbers

Every financial value shown in the page must originate from the real API response or an already-existing frontend calculation that is demonstrably based on real API data.

Do not silently fall back to fake data.

19. LOADING STATE

Implement a loading state that preserves page geometry.

Avoid:

layout jumping
giant spinners
changing card dimensions
removing the entire page while fetching

Use shadcn Skeleton if the primitive already exists and it matches the project architecture.

Otherwise use the project's existing loading pattern.

Loading states should visually resemble the final transaction rows.

20. EMPTY STATE

When there are no transactions:

Belum ada transaksi

Belum ada aktivitas transaksi yang sesuai dengan filter Anda.

The empty state should be visually integrated into the transaction container.

Do not create fake rows.

For filtered empty results, make it clear that the filters/search returned no matching transactions.

21. ERROR STATE

If transaction API requests fail:

show a clear error state;
preserve the page shell;
provide retry if consistent with the existing application patterns;
do not silently show empty data;
do not substitute dummy data.

Use the existing application's error handling conventions.

22. SHADCN USAGE

Use existing shadcn primitives where they already exist.

Potential primitives:

Card
CardHeader
CardContent
Badge
Input
Button
Separator
Skeleton
Dialog
Select / Dropdown if already configured

Do not install dependencies automatically.

Do not generate unnecessary primitives.

Do not replace every existing element just because shadcn provides an equivalent.

Use shadcn as the component foundation while preserving the current visual identity.

23. VISUAL RULES

Follow the reference carefully.

Important characteristics:

clean white/light surfaces
restrained borders
subtle radius
compact typography
clear hierarchy
generous but controlled spacing
transaction list as the primary visual area
filters integrated into the transaction section
amounts aligned consistently
status visually distinguishable
no excessive shadows
no excessive decorative elements

Do not copy the reference's unrelated dashboard widgets.

Do not add:

advertising cards
campaign widgets
unrelated statistics
fake charts
promotional sections
unnecessary illustrations

This is a fintech transaction history page, not an advertising dashboard.

24. RESPONSIVE BEHAVIOR

Desktop:

Header
   ↓
3 summary cards
   ↓
Transaction activity container
   ├── title + currency
   ├── filter/search toolbar
   ├── transaction list
   └── pagination

Mobile:

Header
   ↓
Summary cards
   ↓
Activity
   ├── title
   ├── filters stacked/wrapped
   ├── transaction rows
   └── pagination

Requirements:

no horizontal page overflow;
no clipped transaction amounts;
no overlapping filters;
transaction amount remains readable;
pagination remains usable;
responsive behavior must follow existing breakpoints where possible.
25. FILE SCOPE

Before editing, identify the actual mutation page files.

Expected areas may include:

src/app/...
src/components/...
src/features/...
src/services/...
src/lib/...

Do not assume exact filenames.

Only modify files directly required for this mutation page redesign.

Do NOT modify:

backend
Prisma schema
database migrations
authentication
global financial business logic
unrelated dashboard components
cash-flow components
sidebar/navigation unless required for page consistency
inactive legacy components
API contracts
route definitions
26. BUSINESS LOGIC INVARIANTS

The redesign must not change:

transaction creation
transaction processing
wallet balance
transfer logic
payment logic
transaction status transitions
authentication
authorization
pagination semantics
backend filtering semantics

This is a presentation and interaction redesign only.

27. IMPLEMENTATION PROCESS

Work in small steps.

Step 1 — Inspect

Read:

CLAUDE.md
mutation page
transaction API client/service
transaction types
backend API response contract if available
docs/design/mutation-reference.png

Then report:

Current page structure:
...

Existing API contract:
...

Reference structure:
...

Planned UI structure:
...
Step 2 — Implement page structure

Build:

page header
summary area
activity container
search/filter toolbar
transaction list
pagination

Preserve existing data fetching.

Step 3 — Detail interaction

Implement/retain transaction detail behavior using the existing API.

Step 4 — Loading/empty/error states

Make these consistent with the visual reference.

Step 5 — Responsive refinement

Validate desktop and mobile.

28. VALIDATION

After implementation run:

npm run lint
npx tsc --noEmit
npm test
npm run build

If tests/build scripts do not exist, report that rather than inventing commands.

Then visually inspect:

Desktop
page hierarchy
summary cards
filter toolbar
transaction rows
amount alignment
status badges
pagination
detail modal
no overflow
Mobile
header
summary cards
filter wrapping
transaction row readability
amount visibility
pagination
no horizontal overflow
29. ACCEPTANCE CRITERIA

The implementation is successful only if:

 docs/design/mutation-reference.png was read as an image before implementation.
 Existing CLAUDE.md instructions were followed.
 Page visually follows the provided reference.
 Existing fintech visual identity remains intact.
 Transaction data comes from the real backend.
 Search uses the existing backend search capability.
 Type filter uses the existing backend capability.
 Status filter uses the existing backend capability.
 Pagination uses the existing backend capability.
 Transaction detail uses /transaction/:id.
 No financial values are hardcoded.
 No fake transaction data exists.
 Loading state works.
 Empty state works.
 Error state works.
 Desktop layout works.
 Mobile layout works.
 No horizontal overflow exists.
 No backend/API contract was changed.
 No Prisma/database changes were made.
 No authentication/business logic was changed.
 No unrelated dashboard components were modified.
 lint passes.
 TypeScript passes.
 tests pass if available.
 build passes.
30. STOP CONDITIONS

STOP and ask for direction if:

The backend response does not contain data required by the proposed UI.
An API endpoint documented above does not match the actual backend route.
A new backend endpoint would be required.
Prisma/database changes would be required.
A dependency needs to be installed.
Existing business logic needs to change.
Authentication/state management needs to change.
The reference conflicts with an existing project-wide design rule.
Visual parity requires changing unrelated components.
You are unsure whether a field is safe to expose.
You need to invent transaction types/statuses.
You need to hardcode financial data.
You need to change global layout/navigation.

Do not work around a stop condition by silently making assumptions.

FINAL OUTPUT

After implementation, report:

Files changed
Components added/modified
API endpoints actually used
Search/filter/pagination behavior
Transaction detail behavior
Loading/empty/error states
Responsive behavior
Validation results
Any deviations from the reference
Any limitations caused by the existing backend/API