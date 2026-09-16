Status: Planned
Scope: Frontend UI component architecture
Primary Goal: Standardize existing frontend UI primitives using shadcn/ui without changing application behavior, business logic, API contracts, or intended visual design.

1. Objective

Migrate existing reusable UI components in the frontend to shadcn/ui-based components wherever an appropriate shadcn equivalent exists.

The migration should cover existing UI primitives and components such as:

Card
Checkbox
AspectRatio
Button
Input
Label
Textarea
Select
DropdownMenu
Dialog
Sheet
Tabs
Badge
Avatar
Separator
Progress
Tooltip
Alert
AlertDialog
Skeleton
Table
Switch
RadioGroup
Calendar
Popover
Command
ScrollArea
Breadcrumb
Pagination
Accordion
Collapsible
and other existing components where a suitable shadcn primitive exists.

Important: This is a component architecture migration, not a visual redesign.

2. Core Principle

The migration must follow:

shadcn as the implementation primitive, existing application design as the visual source of truth.

Do not blindly replace existing components with default shadcn styling.

The final UI must preserve:

existing layout
spacing
typography
colors
border radius
sizing
responsive behavior
interaction behavior
accessibility behavior
loading states
error states
disabled states

unless a specific component is intentionally being standardized.

3. Design Reference Priority

Follow the existing CLAUDE.md rules.

Priority:

docs/design/
docs/frontend.md
API contract documentation
Business rules
Existing component behavior
shadcn defaults

The shadcn default appearance must not override the design reference.

If the design reference shows:

12px radius

do not automatically change it to the default shadcn radius.

If the design reference shows:

subtle border

do not introduce a heavier border just because the shadcn component uses one.

4. Current-State Audit

Before modifying code, perform a complete frontend component audit.

Identify:

Existing reusable components

Search:

src/components/
src/components/ui/
src/app/
src/pages/

and any other frontend component directories.

Classify components into:

A. Existing shadcn components

Example:

src/components/ui/button.tsx
src/components/ui/card.tsx
B. Custom components that duplicate shadcn functionality

Example:

CustomCard
CustomCheckbox
CustomModal
CustomDropdown
CustomInput
C. Domain-specific components

Example:

WalletBalanceCard
CashFlowCard
RecentTransactions
TransferLimits
TransactionTable

These should not automatically become shadcn components.

They may internally use shadcn primitives.

D. Components with no suitable shadcn equivalent

Keep them custom.

Do not force them into shadcn.

5. Component Mapping

Create a migration matrix before coding.

Example:

Existing	Type	shadcn Equivalent	Action
Custom Card	Primitive	Card	Migrate
Custom Checkbox	Primitive	Checkbox	Migrate
Custom Button	Primitive	Button	Migrate
Custom Modal	Primitive	Dialog	Migrate
Custom Dropdown	Primitive	DropdownMenu	Migrate
WalletBalanceCard	Domain	Card internally	Keep domain component
CashFlowChart	Domain/Visualization	No direct equivalent	Keep custom
TransactionTable	Domain	Table internally	Keep domain component
Custom Chart	Visualization	No direct equivalent	Keep custom
Custom EmptyState	Domain	No direct equivalent	Keep/customize

Do not replace components merely because their names resemble shadcn components.

6. Shadcn Component Strategy

Use shadcn components as low-level UI primitives.

Recommended architecture:

src/
└── components/
    ├── ui/
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── checkbox.tsx
    │   ├── input.tsx
    │   ├── label.tsx
    │   ├── dialog.tsx
    │   └── ...
    │
    ├── dashboard/
    │   ├── wallet-balance-card.tsx
    │   ├── cash-flow-card.tsx
    │   ├── cash-flow-chart.tsx
    │   ├── recent-transactions-card.tsx
    │   └── transfer-limits.tsx
    │
    └── ...

Domain components remain domain components.

For example:

<Card>
  <CardHeader>
    ...
  </CardHeader>

  <CardContent>
    ...
  </CardContent>
</Card>

rather than converting:

WalletBalanceCard

itself into a generic UI primitive.

7. Required Migration Targets

Audit and migrate all applicable existing UI primitives.

At minimum inspect:

Layout / Container
Card
AspectRatio
Separator
ScrollArea
Resizable
Forms
Button
Input
Textarea
Label
Checkbox
RadioGroup
Select
Switch
Slider
InputOTP
Form
Overlay
Dialog
AlertDialog
Sheet
Drawer
Popover
HoverCard
Tooltip
DropdownMenu
ContextMenu
Menubar
Navigation
Tabs
Breadcrumb
Pagination
NavigationMenu
Command
Feedback
Alert
Badge
Progress
Skeleton
Sonner/Toast if already used
Data
Table
Accordion
Collapsible
Calendar

Only migrate components that actually exist or are required by existing application code.

Do not install every shadcn component just because it exists.

8. Card Migration

Card should become the standard primitive for application cards.

Expected structure:

<Card>
  <CardHeader>
    ...
  </CardHeader>

  <CardContent>
    ...
  </CardContent>
</Card>

Optional:

<CardFooter>
  ...
</CardFooter>

However, preserve existing visual characteristics.

Do not automatically introduce:

extra padding
extra shadows
additional borders
different radius
different background

unless required by the design.

9. Checkbox Migration

Replace custom checkbox implementations with shadcn Checkbox where applicable.

Requirements:

preserve checked state
preserve uncontrolled/controlled behavior
preserve disabled state
preserve form integration
preserve event behavior
preserve accessibility
preserve visual size

Do not change business logic.

10. AspectRatio Migration

Where an existing custom aspect-ratio wrapper exists, evaluate replacing it with shadcn AspectRatio.

Example:

<AspectRatio ratio={16 / 9}>
  ...
</AspectRatio>

Do not use AspectRatio for components that do not actually require fixed aspect ratios.

11. Button Migration

Existing buttons should use the shadcn Button primitive where applicable.

Example:

<Button>
  Transfer
</Button>

Use variants appropriately:

<Button variant="default" />
<Button variant="outline" />
<Button variant="ghost" />
<Button variant="destructive" />

But variants must be mapped to the existing design.

Do not blindly replace every button with the default shadcn appearance.

12. Domain Component Rule

Do not turn domain components into generic UI components.

For example:

CashFlowCard
WalletBalanceCard
RecentTransactionsCard
TransferLimits

remain domain components.

Their implementation can use:

<Card />
<Button />
<Badge />
<Progress />
<Tooltip />

internally.

This keeps the architecture clean:

UI primitives
     ↓
Domain components
     ↓
Pages
13. No Business Logic Changes

The migration must NOT modify:

API requests
API response handling
authentication
authorization
routing
financial calculations
wallet calculations
transaction calculations
transfer logic
validation rules
state management behavior
query behavior
caching behavior
error handling semantics

Only UI implementation should change.

14. No API Changes

Do not modify:

GET /api/v1/dashboard

or any other API contract.

Existing data must continue flowing into components exactly as before.

Example:

<WalletBalanceCard balance={dashboard.wallet.balance} />

must remain functionally equivalent after migration.

15. No Dummy Data

Do not introduce:

const data = [...]

or fake values to make shadcn components look populated.

All displayed financial data must continue coming from the existing API/state.

16. Dependency Policy

Do not install arbitrary UI libraries.

shadcn components should be used according to the existing project setup.

Before adding anything:

inspect package.json
inspect existing components.json
inspect src/components/ui
check whether the required dependency already exists
only add what is genuinely required

Do not install:

Recharts
MUI
Chakra
Ant Design
Mantine
etc.

as part of this migration.

17. Visual Regression Rule

Every migrated component must be compared against the current UI.

The migration is successful only if:

Behavior = same
Layout = same
Visual intent = same
Responsive behavior = same
Accessibility = same or improved
Implementation = shadcn primitive

Do not accept:

"close enough"

for visual differences when the design reference is available.

18. Responsive Requirements

Verify:

Desktop
spacing
alignment
component width
card height
typography
button sizing
Tablet
grid behavior
wrapping
spacing
Mobile
stacking
button width
input behavior
modal/sheet behavior
overflow
typography
touch targets

No migrated component may introduce horizontal overflow.

19. Accessibility

shadcn primitives should retain their accessibility behavior.

Verify:

keyboard interaction
focus state
disabled state
ARIA attributes where applicable
labels
checkbox interaction
dialog focus behavior
dropdown keyboard navigation
tooltip behavior

Do not remove accessibility attributes from existing components unless replaced by the shadcn primitive's equivalent behavior.

20. Migration Order

Use this order:

Phase 1 — Audit

No code changes.

Produce:

component inventory
component → shadcn mapping
migration priority
potential breaking points
Phase 2 — Foundation

Migrate:

Button
Card
Input
Label
Checkbox
Separator
Badge
Phase 3 — Form Components

Migrate:

Select
Switch
RadioGroup
Textarea
Form
Slider
Calendar where applicable
Phase 4 — Overlay Components

Migrate:

Dialog
AlertDialog
Sheet
Popover
Tooltip
DropdownMenu
Phase 5 — Data / Navigation

Migrate applicable:

Table
Tabs
Pagination
Breadcrumb
Accordion
Collapsible
ScrollArea
Phase 6 — Domain Component Integration

Update domain components to consume the standardized primitives.

Example:

WalletBalanceCard
        ↓
      Card
      Button

CashFlowCard
        ↓
      Card
      Badge
      Tooltip

TransactionTable
        ↓
      Table
      Badge
21. Validation

After every migration phase:

npm run type-check
npm run lint

If available:

npm run build

Do not hide unrelated existing errors.

Clearly separate:

pre-existing errors

from:

errors introduced by migration
22. Definition of Done

The migration is complete when:

 Existing UI primitives have been audited
 shadcn equivalents identified
 Appropriate primitives migrated
 Duplicate custom primitives removed where safe
 Domain components remain domain components
 No business logic changed
 No API contract changed
 No authentication/routing changes
 No dummy financial data
 No unnecessary dependencies added
 Design references remain respected
 Desktop verified
 Mobile verified
 Type-check passes
 Lint passes
 Build verified if environment allows it
 No new horizontal overflow
 No visual regression that contradicts the design reference