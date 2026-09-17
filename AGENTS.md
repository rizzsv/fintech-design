
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

# AI CODING RULES

## Core Behavior

- Inspect before modifying.
- Reuse existing architecture and components.
- Make the smallest change that solves the task.
- Do not rewrite working systems.
- Do not invent APIs, schemas, components, or business rules.
- Do not modify unrelated files.
- Never use dummy financial/business data.
- Never expose secrets, tokens, passwords, or credentials.
- Keep database access inside the existing Repository layer.
- Preserve existing API contracts unless explicitly requested.
- Preserve existing authentication/session/JWT behavior unless explicitly requested.

## Workflow

For small tasks:
1. Inspect relevant files.
2. Identify root cause.
3. Implement minimal fix.
4. Run targeted validation.
5. Report changed files and result.

For large tasks:
1. Audit.
2. Report findings.
3. Propose minimal plan.
4. Implement in small batches.
5. Validate each batch.
6. Perform final audit.

Do NOT produce a large planning document for a small task.

## Scope

Only inspect files relevant to the current task first.

Do not scan the entire repository unless:
- the relevant implementation cannot be located,
- architecture dependencies are unclear,
- or the task explicitly requires a repository-wide audit.

## Frontend

- Existing Dashboard is the visual source of truth.
- Reuse existing components before creating new ones.
- Match existing spacing, typography, responsive behavior, and layout.
- Read design references before implementing visual changes.
- Do not redesign unrelated pages.

## Backend

- Follow existing Controller → Service → Repository architecture.
- Prisma access belongs in Repository.
- Reuse existing validation, errors, response utilities, mailer, JWT, and transaction patterns.
- Do not introduce new architecture when existing architecture can support the feature.

## Security

- Never log passwords.
- Never log JWTs.
- Never log refresh tokens.
- Never log verification tokens.
- Never expose secrets in responses.
- Use cryptographically secure token generation.

## Dependencies

- Do not install dependencies unless necessary.
- If a dependency is required, stop and report it before installing.

## Validation

Use the smallest relevant validation first.

For a UI change:
- lint
- typecheck
- visual/browser check

For a backend change:
- lint
- typecheck
- targeted tests
- relevant API test

Run full build/test only when appropriate.

## Stop Conditions

Stop and ask only when:
- requirements conflict,
- required information cannot be determined from the repository,
- a backend/API/schema change is required but not authorized,
- destructive changes are required,
- dependency installation is required,
- security implications are unclear.

Do not ask for information that can be determined by inspecting the codebase.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
