# Frontend Agent Rules

## Project

This is an existing fintech frontend.

The primary objective is to redesign UI/UX
without breaking existing functionality.

## Protected Systems

DO NOT modify:

- Backend
- API contracts
- TanStack Query logic
- Zustand stores
- Authentication
- Business logic
- Validation
- Routing

## Allowed Changes

You may modify:

- Components
- JSX/TSX structure
- Styling
- Layout
- Responsive behavior
- UX interactions
- Loading states
- Empty states
- Error states
- Animations

## Dependencies

Prefer existing dependencies.

Use:

- Motion
- Radix UI
- Lucide React
- clsx
- class-variance-authority

Do not introduce unnecessary dependencies.

## Workflow

Before editing:

1. Inspect the relevant page.
2. Inspect related components.
3. Inspect existing data flow.
4. Understand current implementation.
5. Create a plan.
6. Implement only the approved scope.

After editing:

1. Run TypeScript checks.
2. Run lint.
3. Check responsive behavior.
4. Check accessibility.
5. Check reduced motion.
6. Verify API/data-fetching code was not modified.