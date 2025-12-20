# NestJS Service Template (Independent Microservice Boilerplate)

Template NestJS ready to be duplicated for **independent microservices** (one repo per service).
Goal: start every service with the same **clean structure**, **quality gates**, and **developer workflow**.

---

## Structure

- src/app → bootstrap & wiring
- src/interfaces → HTTP controllers
- src/application → use cases
- src/domain → business rules
- src/infrastructure → DB, external services
- src/config → configuration

---

## What this template provides

- **Clean folder structure** inspired by **DDD / Clean Architecture**:
  - `interfaces/` (HTTP controllers, routes/adapters)
  - `application/` (use-cases, orchestration, policies)
  - `domain/` (business rules, entities/value objects, pure logic)
  - `infrastructure/` (DB, external clients, caches, rate-limiters, adapters implementations)
  - `config/` (configuration, env validation, constants)
  - `app/` (Nest bootstrap + module wiring)
- **Code formatting** (Prettier)
- **Code linting + import order** (ESLint)
- **Git hooks** (Husky + lint-staged) to block dirty commits
- **Commit message rules** (Commitlint + Conventional Commits)
- **Tests isolated in `test/`** (Jest with a dedicated config file)
- A minimal **`GET /health`** endpoint

---

## Layering rules (recommended)

- `domain/` should NOT depend on NestJS or infrastructure.
- `application/` can depend on `domain/` but not on frameworks directly.
- `interfaces/` depends on `application/` (calls use-cases) and maps HTTP <-> app.
- `infrastructure/` implements ports/adapters required by `application/` (DB clients, HTTP clients, caches).
- `app/` wires everything together (modules, providers, bootstrap).

---

## Package manager: pnpm

This repo uses **pnpm** (fast + good for multiple repos/services).

Install dependencies:

```bash
pnpm install
pnpm start:dev
```

---

## Structure & Tooling Overview

This project is a NestJS microservice boilerplate designed for independent services with strong quality gates, clean architecture (DDD-inspired), and a professional developer workflow.

---

## Available Commands

### Run (development)

```bash
pnpm start:dev
```

### Build

```bash
pnpm build
```

### Run (production)

Because the entrypoint is src/app/main.ts, the compiled output is dist/app/main.js:

```bash
pnpm start:prod
```

---

### Testing (Jest)

Tests are isolated outside src/ and live under test/.

```bash
pnpm test
```

### Jest setup

- Tests are stored in test/ (not in src/)
- A dedicated Jest configuration file is used:
  - jest.config.ts at the repository root
- pnpm test runs:

```bash
jest -c jest.config.ts
```

### Why this setup?

- Avoids NestJS default Jest config limiting test discovery to src/
- Keeps src/ focused on production code only
- Makes it easy to scale into:
  - test/unit
  - test/integration

Example test:

```bash
test/unit/smoke.spec.ts
```

---

### Code Formatting (Prettier)

Prettier enforces consistent code style automatically:

- consistent quotes, semicolons, indentation
- clean Git diffs
- no formatting debates

Configuration files:

- .prettierrc
- .prettierignore

Commands:

```bash
pnpm format        # format files
pnpm format:check # check formatting (no changes)
```

Formatting happens:

- manually via pnpm format
- automatically on commit via lint-staged

---

### Linting & Import Order (ESLint)

ESLint is used to:

- detect bugs before runtime
- prevent unsafe patterns
- enforce clean import ordering

Configuration:

- .eslintrc.cjs

Commands:

```bash
pnpm lint
pnpm lint:fix
```

### Git Hooks (Husky + lint-staged)

Git hooks are enabled to block bad commits.

Folder:

```bash
.husky/
```

Hook:

```bash
.husky/pre-commit
```

## What happens on commit?

1. Prettier formats staged files
2. ESLint auto-fixes what it can
3. If issues remain → commit is blocked

This guarantees:

- clean code
- consistent formatting
- no broken commits

---

### Commit Message Rules (Commitlint + Conventional Commits)

Commit messages must follow Conventional Commits.

Configuration:

- commitlint.config.cjs

Hook:

- .husky/commit-msg

If a commit message does not respect the convention, it is rejected.

### Commit format

```bash
<type>(<scope>): <subject>
```

### Examples (valid)

```bash
feat(auth): add login endpoint

fix(gateway): handle timeout

refactor(order): simplify pricing rules

chore(tooling): update eslint config

docs(readme): explain workflow

test(user): add unit tests
```

### Common types

- feat → new feature
- fix → bug fix
- refactor → refactor without behavior change
- chore → tooling / config / non-product code
- docs → documentation
- test → tests only

### Scope examples

```bash
gateway, auth, order, catalog, payment, tooling
```

Invalid examples (will be blocked):

```bash
git commit -m "test"
git commit -m "wesh"
```

---

## TypeScript path alias (@/\*)

This boilerplate supports clean imports using the `@/*` alias:

Where it is configured:

- tsconfig.json (compilerOptions.baseUrl + paths)
- tsconfig.build.json extends tsconfig.json (alias works in production build)
- jest.config.ts (moduleNameMapper) so tests resolve @/\*
- ESLint resolves aliases via eslint-import-resolver-typescript + tsconfig.json

---

## Environment Variables

Recommended setup:

- .env.example ✅ committed (documents required variables)
- .env ❌ not committed (local development)
- .env.local ❌ not committed (optional local overrides)

Make sure .gitignore includes:

```bash
.env
.env.local
```

## Creating a New Microservice from This Template

Recommended workflow:

1. Mark this repository as a GitHub Template
2. Use "Use this template" to create a new repo (e.g. auth-service)
3. Update per-service values:
   - package.json → service name
   - .env.example → SERVICE_NAME, PORT, DB settings
   - README.md title (optional)

## Notes / Future Improvements (Optional)

Possible next steps when needed:

- Integration tests with supertest
- Docker + docker-compose for local DB
- Minimal CI (lint / test / build)
- Environment validation with @nestjs/config + zod

## Quick Sanity Check

After cloning:

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm start:dev
```

Then test:

```bash
curl http://localhost:3000/health
```
