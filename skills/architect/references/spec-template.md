---
description: Architecture Spec output template. Load this file when producing the final Architecture Spec.
---

# Architecture Spec: \[Feature Name\]

## Overview

\[2-3 sentences on the chosen architectural approach.\]

## Decisions

\[Key technical decisions made, with brief rationale for each.\]

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ... | ... | ... |

## Project Context

*This section is the single source of project conventions for the Implementer and Code Reviewer. Both agents must read this section and only perform additional exploration if a specific detail is missing.*

### Structure

\[Top-level directory layout, source root, test root, module organization\]

### Conventions

\- **Naming:** \[PascalCase, camelCase, kebab-case, etc.\]
\- **Code style:** \[Indentation, import ordering, idioms, formatting rules\]
\- **Test style:** \[Framework, assertion library, naming conventions, test organization\]
\- **DI pattern:** \[Constructor injection, service location, etc.\]

### Dependencies

\- **Runtime:** \[Key libraries and frameworks with versions\]
\- **Build:** \[Build tool, multi-module structure, etc.\]
\- **Infrastructure:** \[Database, cache, queue, external services\]

### Patterns

\- \[Key architectural patterns used: Handler pattern, Repository pattern, etc.\]

## Component Design

### Components / Modules

| Component | Input | Output | Description |
|-----------|-------|--------|-------------|
| \`CreateOrderHandler\` | \`CreateOrderInput\` | \`OrderResult\` | Creates a new order... |

### Inputs / Outputs

\[For each contract: name, fields with types, validation rules\]

### Validators

\[For each validator: which input it validates, what business rules it checks\]

### External Boundaries

| Interface | Implementation | External System | Purpose |
|-----------|---------------|-----------------|---------|
| \`OrderRepository\` | \`OrderStore\` | Order DB | CRUD for orders |

### Public Entry Points (controllers, handlers, components, exported functions, etc.)

| Method | Path / Trigger | Input | Output | Status Codes / Errors |
|--------|---------------|-------|--------|-----------------------|
| POST | \`/orders\` | \`CreateOrderInput\` | \`OrderResult\` | 201, 400, 409 |

## Package Structure

\[Show where each new file goes in the existing project tree\]

project-root/
├── <directory>/
│   └── OrderController.<ext>          ← NEW
├── <directory>/
│   ├── CreateOrderHandler.<ext>       ← NEW
│   └── <directory>/
│       └── CreateOrderInput.<ext>    ← NEW
├── <directory>/
│   └── OrderRepository.<ext>          ← NEW
└── <directory>/
    └── Order.<ext>                    ← NEW

(File extensions and directory structure match the project's conventions)

## Data Flow

\[Describe the request lifecycle from entry to response\]

## Error Handling

| Error | Status / Error Code | When |
|-----------|---------------------|------|
| \`OrderAlreadyExists\` | 409 / Conflict | Duplicate order ID |

## Test Strategy

\[Which tests are needed: unit tests for core logic/validators, integration tests for external boundaries, API/component tests for entry points\]

## Open Items for Implementer

\[Any decisions deferred to implementation time, or things the Implementer should watch out for\]
