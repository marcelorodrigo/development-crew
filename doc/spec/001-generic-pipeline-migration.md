---
date-generated: 2026-04-28
source-folder: projects/ai-crew-plugin
document-status: ready-for-implementer
target-repo: https://github.com/marcelorodrigo/development-crew
target-issue: https://github.com/marcelorodrigo/development-crew/issues/9
---

# Architecture Spec: Generic skill-aware pipeline migration

## Overview

Migrate Development Crew's five agents from Spring-Boot-specific prompts to **domain-agnostic, skill-aware** prompts. The plugin keeps owning the **pipeline process** (brainstorm → architect → implement → review) and **pipeline values** (handoff discipline, validated artifacts, no implementation without a spec, no merge without review). It stops owning the **technical opinions** (Clean Architecture, UseCase pattern, Spring Boot conventions). Those move to user-installed skills.

When relevant skills are present in the user's environment, agents discover and load them; otherwise they fall back to the model's built-in knowledge.

This work covers all five agent prompts and the README. There is no code change — this is a prompt-engineering migration. No ADR is created in this work; if one is needed later it can be a follow-up.

## Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Skill-discovery mechanism | **Hybrid** — prompt-based instruction + tool call | Agents inspect environment for an injected `<available_skills>` block (or platform equivalent), match against project signals, then attempt to load via whatever skill tool the platform exposes. Degrades gracefully when skills are absent. Platform-agnostic. |
| 2 | How agents reference skills | **By capability**, not exact name | Prompts describe what to look for ("a Vue/Nuxt skill", "a frontend testing skill") rather than hardcoding `vue`, `nuxt`, etc. Resilient to skill renames and ecosystem changes. |
| 3 | Curated skills list in README | **Out of scope** for this migration | Tracked as a follow-up. Avoids inventing/listing skill names that may not exist or may change. |
| 4 | Architect / Implementer / Reviewer opinionated stance | **Option Y — keep pipeline values opinionated, move technical opinions to skills** | Agents stay sharp on process discipline (no implementation without spec, tests required, no handwaving) but become method-agnostic on technical choices. Without this, agents become bland. |
| 5 | README "Architectural principles enforced" section | **Replace** with domain-neutral pipeline values | Deletion leaves a gap; readers expect opinionation on the agents. New text describes pipeline discipline, not Clean Architecture. |
| 6 | rubber-duck and orchestrator scope | **In scope** for this migration | Both contain Spring leakage (audited). One coherent migration is better than two half-done states. |
| 7 | Code Reviewer branch detection | **Detect default branch dynamically** | Replace hardcoded `master` with `git symbolic-ref refs/remotes/origin/HEAD` (with fallbacks). Works for `main`, `master`, `develop`, etc. |
| 8 | "Meet the Crew" README descriptions | **Update to remove Spring-flavored phrasing** | E.g., Implementer's mention of "Lombok annotations". README must match agent prompts. |
| 9 | ADR file as part of this work | **No** | User decision: skip ADR for this migration. The issue itself documents intent; ADR can be added later if needed. |
| 10 | Build / package / version changes | **Out of scope** | No `package.json`, `tsup.config.ts`, `src/` changes. Versioning handled by CI/CD. |

## Component Design

### Skill-discovery instruction (shared block)

A reusable instruction block to be embedded into the Architect, Implementer, and Code Reviewer agents (rubber-duck has a lighter variant — see below).

**Canonical text** (Implementer should use this near-verbatim, adapting only the verb tense and surrounding context):

```markdown
## Skill Discovery

Before starting work, check what skills are available in the current environment:

1. Inspect the system context for any `<available_skills>` block (or platform equivalent listing of skills).
2. Detect the project's tech stack from concrete signals:
   - Build manifests: `package.json`, `pom.xml`, `build.gradle`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Gemfile`, `composer.json`
   - Framework configs: `nuxt.config.*`, `next.config.*`, `vite.config.*`, `angular.json`, `application.yml`, `application.properties`
   - Language signals: `tsconfig.json`, file extensions in source directories
3. Identify which available skills match the detected stack (by capability, not by exact name — e.g., "a Vue/Nuxt skill", "a backend framework skill", "a testing-framework skill").
4. Load the matching skills using whatever skill-loading tool the platform exposes (e.g., a `skill` tool in OpenCode, a `Skill` tool in Claude Code).
5. If no skills are available or none match, proceed with the model's built-in knowledge — do not block on missing skills.

Be transparent: state which skills you loaded (or that none were available) at the start of your output.
```

The rubber-duck variant is shorter — it explores rather than implements, so loading the full skill set isn't always necessary, but it should still be aware:

```markdown
## Skill Awareness

If `<available_skills>` (or a platform equivalent) is present in your context and any match the project's tech stack, load them before exploring options — they may surface domain-specific trade-offs you'd otherwise miss. If no skills are available, rely on the model's built-in knowledge. Don't block on missing skills.
```

The orchestrator does **not** need a skill-discovery block — it never does technical work itself. It only needs Spring leakage removed.

### Branch-detection snippet (Code Reviewer only)

Replace the current four `git` commands (which assume `master`) with a default-branch-aware sequence:

```markdown
## Step 1 — Establish the Diff Against the Default Branch

First, detect the repository's default branch:

```bash
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null | sed 's@^origin/@@')
# Fallbacks:
# - If origin/HEAD is not set: try `git rev-parse --abbrev-ref HEAD@{upstream}` or assume `main`
# - If on a fresh clone with no upstream: ask the user which branch to diff against
```

Then run, in order:

```bash
git branch --show-current
git log --oneline "$DEFAULT_BRANCH"..HEAD
git diff --name-only "$DEFAULT_BRANCH"...HEAD
git diff "$DEFAULT_BRANCH"...HEAD
```

Report at the top of your review: branch name, default branch detected, commit list, and changed files.
```

## Per-file Change Plan

For each file: read the current file, apply the listed deltas, save. **Do not rewrite end-to-end** unless the delta count exceeds half the file — preserve the author's voice and structure.

### `agents/architect.agent.md`

| Location | Current | Change to |
|---|---|---|
| Frontmatter `description` | "Architecture formalizer for Spring Boot development. Takes a brainstorm brief and produces a formal architecture specification using Clean Architecture, UseCase pattern, and Spring Boot best practices. Sits after Rubber Duck and before Implementer in the pipeline." | "Architecture formalizer. Takes a brainstorm brief and produces a formal architecture specification grounded in the project's tech stack and any available skills. Sits after Rubber Duck and before Implementer in the pipeline." |
| `# Identity` (lines 8–12) | "specializing in Spring Boot services built with Clean Architecture principles" / "follow Clean Architecture (Uncle Bob), the UseCase pattern, and Spring Boot conventions rigorously" / "you apply the one that works: Clean Architecture..." | "You are a senior software architect. You take loosely explored ideas and turn them into precise, buildable architecture specifications. You are opinionated about **process discipline** — you name every component, place every file, and define every boundary before the Implementer writes the first line. You are method-agnostic about **architectural style** — you apply the style appropriate to the project's tech stack and any loaded skills (Clean Architecture for some backends, component-driven for frontends, hexagonal where it fits, etc.). Vagueness is your enemy; precision is your craft." |
| `## Step 2 — Explore Existing Architecture` (lines 44–54) | Spring-specific bullets: "Find the base package", "existing UseCases", "annotation usage", "`pom.xml`", "`application.yml`/`application.properties`" | Generic bullets: "Project structure: identify directories, conventions, layering"; "Existing patterns: how do existing components / modules / use cases / features look?"; "Conventions: naming, file structure, test layout"; "Dependencies: read the project's manifest (`package.json`, `pom.xml`, `pyproject.toml`, etc.) for available libraries"; "Configuration: framework configs, environment files, feature flags". |
| `### 3.1 — Component Breakdown` (lines 60–66) | "UseCases", "Request/Response records", "validators", "gateway interfaces", "domain models" | Generic: "What components / modules / functions need to be created or modified?"; "What input/output contracts are needed?"; "What validation is required and where does it live?"; "What abstractions over external systems are needed?"; "What domain concepts are involved?" |
| `### 3.3 — API Design` (lines 73–77) | "REST endpoints", "Bean Validation + domain validators" | "Public-facing contracts (REST, GraphQL, RPC, library API, component props/events — whatever applies); request/response shapes; error contracts; validation strategy" |
| `### 3.4 — Data Flow` (line 81) | "controller → use case → gateway → external system/database" | "entry point → business logic → external boundaries (database, services, UI) and back" |
| `## Output Format — Architecture Spec` template (lines 99–175) | Java-flavored UseCase / Gateway / Controller tables; `src/main/java/com/example/...` package tree | Generalize: rename "UseCases" → "Components / Modules"; "Request/Response Records" → "Inputs / Outputs"; "Gateways" → "External Boundaries"; "Controllers" → "Public Entry Points (controllers, handlers, components, exported functions, etc.)". Replace the example tree with a generic placeholder showing how new files plug into the project's existing structure. |
| `# Architectural Principles` (lines 177–191) | 10 Spring-specific principles (`@Transactional`, `@RequiredArgsConstructor`, "Java record types", etc.) | Replace with **pipeline & design principles** (domain-neutral): (1) Match the project's existing conventions before inventing new ones. (2) Single Responsibility — one component, one purpose. (3) Dependencies point toward the core / domain. (4) External systems are accessed through abstractions, not directly. (5) Errors are domain-meaningful, not generic. (6) Immutability where it doesn't fight the framework. (7) Constructor / explicit dependency injection over hidden globals. (8) Test-first thinking — every component should be independently testable. (9) Defer to loaded skills for stack-specific conventions. (10) Be concrete — name every component, every field, every endpoint. |
| `# Rules` (lines 192–198) | Generic but references Spring-style rules implicitly | Keep largely as-is. Add an explicit rule: "Skills override generics. If a loaded skill defines stack-specific conventions, follow them. The principles above are the floor when no skill applies." |
| Add **Skill Discovery** block | Not present | Insert canonical Skill Discovery block (see Component Design above) between `# How You Work` and `## Step 1 — Validate the Input`. Include "Step 0 — Skill Discovery" framing for clarity. |

### `agents/implementer.agent.md`

| Location | Current | Change to |
|---|---|---|
| Frontmatter `description` | "Builder agent for Spring Boot development. Takes an architecture specification and implements it..." | "Builder agent. Takes an architecture specification and implements it, writing production code, tests, and configuration matching the project's conventions and any available skills. Sits after Architect and before Code Reviewer in the pipeline." |
| `# Identity` (lines 8–11) | "senior Spring Boot developer" / "no more, no less" | "senior software engineer. You receive architecture specifications and turn them into working implementations. You are disciplined: you follow the spec, you follow the conventions already in the codebase, you load relevant skills before writing the first line, and you write code that is readable, testable, and maintainable. You don't over-engineer, and you don't cut corners." |
| `## Step 2 — Explore Existing Conventions` (lines 41–49) | "Lombok usage, annotation placement, import ordering" / "Base classes, naming conventions, assertion libraries" / "`pom.xml`/`build.gradle`" | Generic: "Code style: how are existing files formatted? (imports, naming, comments, idioms specific to the language/framework)"; "Test style: existing test structure, naming conventions, assertion utilities"; "Configuration: project manifest, lockfile, available libraries"; "Patterns: how do existing components/modules look? Match their style exactly." |
| `## Step 3 — Implement in Order` (lines 50–64) | Java-specific 10-step list: domain models → exceptions → gateways → records → validators → UseCases → gateway impls → controllers → config → tests | Generalize: "Implement in the order that minimizes broken intermediate states. A typical order is: data structures → core domain logic → external boundaries → public entry points → wiring/configuration → tests. Adapt the order to the spec and the loaded skills." |
| `# Implementation Standards` → `## Java Code` (lines 86–98) | Java/Lombok/Spring rules | Replace section heading with `## Code` and rewrite as language-neutral: "Use immutable / value types where the language supports them"; "Prefer explicit dependency injection over hidden state"; "Validate inputs at boundaries"; "Use domain-meaningful error types, not generic exceptions"; "Keep functions short and focused"; "Defer language- and framework-specific idioms to the loaded skills"; "Match the existing codebase's conventions over textbook style." |
| `## Spring Boot` section (lines 100–106) | Spring-specific rules | **Delete**. Move any genuinely-universal points into the `## Code` section. The skill, if loaded, supplies framework-specific guidance. |
| `## Tests` section (lines 108–114) | "AssertJ", "Mockito" | Generic: "Use descriptive test names that describe behavior"; "Use the project's existing assertion / mocking libraries"; "One assertion concept per test"; "Test edge cases and error paths, not just happy paths"; "Defer to loaded skills for framework-specific testing patterns." |
| `# Output` template (lines 117–144) | Examples reference `.java` files | Replace example file extensions with `<ext>` placeholders, or use a comment "(file extensions match the project)". Keep the structure. |
| Build status check (line 80, 138) | Implies `mvn` / Gradle build | Generalize: "Run the project's build/test command (e.g., `pnpm build`, `mvn verify`, `cargo test`, `pytest`, etc., as defined in the project)". Don't enumerate; defer to the loaded skill or project manifest. |
| Add **Skill Discovery** block | Not present | Insert canonical Skill Discovery block between `# How You Work` and `## Step 1 — Understand the Spec`. Frame as "Step 0 — Skill Discovery". |
| `# Rules` (lines 146–154) | Generic, but rule 5 says "No TODOs" — keep | Add a new rule: "Skills override generics. If a loaded skill defines stack-specific conventions, follow them. The standards above are the floor when no skill applies." |

### `agents/code-reviewer.agent.md`

| Location | Current | Change to |
|---|---|---|
| Frontmatter `description` | "Code review agent for Spring Boot development... validates against architecture specs, Clean Architecture principles, and Spring Boot best practices." | "Code review agent. Validates implementations against architecture specs, project conventions, and any loaded skills. Read-only — never modifies code. Sits at the end of the pipeline after the Implementer." |
| `# Identity` (lines 7–14) | "Spring Boot best practices: is the framework used correctly and idiomatically?" | Replace third "source of truth" with: "Project conventions and any loaded skills — are stack-specific best practices followed?" |
| `## Step 1 — Establish the Diff Against Master` (lines 33–47) | Hardcoded `master` in four git commands | Replace with the **branch-detection snippet** from Component Design above. Heading becomes "Establish the Diff Against the Default Branch". |
| `### Architecture Compliance` checklist (lines 53–59) | "Controller → UseCase → Gateway → External" | "Layer/module boundaries match the spec and the project's existing structure"; "Each component lives in the correct location"; "External-system access goes through the project's standard abstractions" |
| `### Clean Architecture` heading + checklist (lines 61–67) | Spring-specific items: "UseCases", "Request/Response types properly defined as records", "domain exceptions" | Rename heading to `### Design Principles`. Items: "Each component does one thing (Single Responsibility)"; "Inputs/outputs use the project's standard contract types"; "Errors are domain-meaningful, not generic"; "Business logic lives where the spec said it should"; "Validators check business rules, not framework-level concerns already covered by the framework". |
| `### Spring Boot Best Practices` (lines 69–76) | Spring-specific (`@Autowired`, `@Transactional`, `@ControllerAdvice`, `@Value`) | Rename to `### Stack Conventions`. Items: "Dependencies are injected explicitly (no hidden globals)"; "Transactional / side-effect boundaries are correct for the framework in use"; "Public-facing contracts use correct status codes / error shapes"; "Input validation is present at boundaries"; "Exception handling follows the project's pattern"; "No hard-coded configuration (use the project's config mechanism)". Add: "If a stack-specific skill is loaded, validate against its checklist as well." |
| Add **Skill Discovery** block | Not present | Insert canonical Skill Discovery block between `# How You Work` and `## Step 1 — Establish the Diff...`. Frame as "Step 0 — Skill Discovery". |

### `agents/rubber-duck.agent.md`

| Location | Current | Change to |
|---|---|---|
| Frontmatter `description` | "Brainstorming sparring partner for Spring Boot development." | "Brainstorming sparring partner. Helps explore vague ideas, challenge assumptions, and widen the solution space before committing to formal decisions. Sits before the Architect in the pipeline. Invoke when you have a vague idea, want to explore trade-offs, or need to think through a problem before formalizing." |
| `# Identity` line 12 | "deep expertise in Spring Boot, Java, distributed systems, and Clean Architecture" | "deep expertise in software design, distributed systems, and software engineering trade-offs across multiple stacks" |
| Add **Skill Awareness** block | Not present | Insert the lighter Skill Awareness block (see Component Design above) at the top of `## Phase 2 — Explore the Codebase`, or as a new "Phase 1.5". |

### `agents/orchestrator.agent.md`

| Location | Current | Change to |
|---|---|---|
| Frontmatter `description` | "Workflow orchestrator for Spring Boot development." | "Workflow orchestrator. Manages the 4-agent pipeline (RubberDuck → Architect → Implementer → CodeReviewer) with optional human approval gates between steps. Supports autonomous and human-in-the-loop modes. Entry point for full-pipeline execution from Jira tickets or user requests." |
| `# Identity` line 8 | "managing multi-agent development workflows for Spring Boot projects" | "managing multi-agent development workflows" |
| Anti-pattern examples (lines 56–67, 727–749) | Spring/JWT/Spring Security/MongoDB/PostgreSQL examples | Keep the examples but replace technical content with stack-neutral examples. E.g., "Should I use MongoDB or PostgreSQL?" → keep (it's already stack-neutral); "What's the best way to structure Spring Boot controllers?" → "What's the best way to structure HTTP handlers?"; "Show me how to implement JWT authentication" → "Show me how to implement token-based authentication"; "Here's a code example: `@Bean public SecurityFilterChain...`" → "Here's a code example: [generic placeholder]". |
| Line 377 (Next Steps section) | "Run final tests: `mvn clean verify`" | "Run final tests using the project's build/test command" |
| Line 810 ("Final Notes") | "Your expertise is workflow management, not Spring Boot development." | "Your expertise is workflow management, not software engineering itself." |

Skill Discovery block is **not** added to the orchestrator.

### `README.md`

| Section | Change |
|---|---|
| Top tagline (line 8) | Currently: "A five-agent AI development pipeline · Clean Architecture · UseCase pattern · Production-ready · Automated workflow orchestration". Change to: "A five-agent AI development pipeline · Skill-aware · Process-disciplined · Production-ready · Automated workflow orchestration". |
| Manual switching paragraph (line 89) | "validates the implementation against the spec and Clean Architecture principles" → "validates the implementation against the spec and project conventions" |
| Architect "Architectural principles enforced" subsection (lines 228–235) | Replace with **Pipeline values enforced**: (1) No implementation without a spec. (2) Validated handoffs between phases. (3) No merge without review. (4) Skills override generics — stack-specific conventions come from loaded skills, not from the agents themselves. (5) Be concrete — name every component, every contract. |
| Implementer description (line 240) | Currently mentions "Lombok annotations". Change "the Lombok annotations, the test naming conventions, the assertion libraries" → "the language idioms, the test naming conventions, the assertion libraries". |
| Code Reviewer description (line 255) | "validates against the Architecture Spec, Clean Architecture principles, and best practices" → "validates against the Architecture Spec, project conventions, and any loaded skills" |
| Add new section | Add a short section after "Meet the Crew" called **Skill Awareness** explaining that agents discover and load relevant skills from the user's environment when present, and that a curated list of recommended skills per stack is **planned as a follow-up**. (Two short paragraphs, no skill names listed.) |

## Package Structure

No structural changes. Files modified in place:

```
agents/
├── architect.agent.md        ← MODIFIED
├── code-reviewer.agent.md    ← MODIFIED
├── implementer.agent.md      ← MODIFIED
├── orchestrator.agent.md     ← MODIFIED
└── rubber-duck.agent.md      ← MODIFIED
README.md                     ← MODIFIED
```

No new files. No deletions. No `src/`, `package.json`, `tsup.config.ts`, `scripts/`, or `.github/` changes.

## Data Flow

Agent invocation flow is unchanged. The only behavioral change is the new **Step 0 — Skill Discovery** at the start of Architect, Implementer, and Code Reviewer (and the lighter "Skill Awareness" in Rubber Duck), which:

1. Inspects the agent's runtime context for available skills.
2. Detects project tech stack from manifest files.
3. Loads matching skills via the platform's skill-loading tool.
4. Falls back gracefully when no skills are available.

The orchestrator's coordination flow (Phase 0 → Phase 1 → Phase 2 → Phase 3) is untouched.

## Error Handling

This is a prompt-only migration. There is no runtime error path to design. The only failure modes worth calling out for the Implementer:

- **Missing skill tool** — If a platform doesn't expose a skill-loading tool, the Skill Discovery instruction degrades to "use the model's built-in knowledge". The instruction text in Component Design covers this explicitly.
- **No matching skill** — Same fallback. Agents must not block.
- **Unknown branch** in Code Reviewer — branch-detection snippet has fallbacks (upstream → ask the user).

## Test Strategy

This repo has no automated tests for prompts. Verification is manual.

**Pre-merge checks** (Implementer must run all of these before declaring done):

1. **Lint check** — `node scripts/verify-agents.mjs` if it exists; otherwise skip.
2. **Build check** — `pnpm install && pnpm build`. Must succeed without errors.
3. **Spring-leakage grep** — none of the following should appear in `agents/` or `README.md`:
   ```
   spring | Spring | spring-boot | Spring Boot | Lombok | pom.xml | application.yml |
   application.properties | Jakarta | MockMvc | AssertJ | Mockito | @Transactional |
   @Autowired | @RequiredArgsConstructor | @ControllerAdvice | @RestController |
   src/main/java | com\.example | mvn | gradle
   ```
   Run: `grep -REn -i 'spring|lombok|pom\.xml|application\.ya?ml|jakarta|mockmvc|assertj|mockito|@Transactional|@Autowired|@RequiredArgsConstructor|@ControllerAdvice|@RestController|src/main/java|com\.example|\bmvn\b|\bgradle\b' agents/ README.md` — must return zero results.
4. **Skill-awareness grep** — `grep -l -i 'skill' agents/*.md` — must list at least architect, implementer, code-reviewer, rubber-duck (all four). Orchestrator is not required to mention skills.
5. **Branch-agnostic check** — `grep -n 'master' agents/code-reviewer.agent.md` — must return zero results, OR only `master` references that are obviously generic (e.g., inside `$DEFAULT_BRANCH` documentation).
6. **Issue #9 acceptance criteria** — walk through each checkbox in https://github.com/marcelorodrigo/development-crew/issues/9 and confirm it's satisfied.

**Manual smoke test (recommended but not blocking)**:
- Open the plugin's agents in OpenCode against any non-Spring project (a Vue/Nuxt project is ideal — fep-apps works) and confirm the Architect/Implementer/Reviewer don't refuse or apologize for non-Spring code.

## Out of Scope

- ADR file (`doc/adr/0002-...md`) — explicitly skipped per user decision.
- Curated "Recommended skills" list with concrete skill names — tracked as a follow-up.
- `package.json`, `tsup.config.ts`, `src/`, `scripts/`, `.github/` changes.
- Version bumps (release-please / CI/CD owns versioning).
- Local commits or pushes (per global rule — Marcelo handles git operations).
- Specialist sub-agents (router + per-domain) — explicitly deferred per issue #9 "Out of scope".
- spring-crew-plugin's fate — separate decision.

## Open Items for Implementer

1. **Voice consistency** — The current agents have a strong, almost literary voice ("It was born in the silence before the first commit..."). Preserve that tone after rewrites. If a rewrite makes a section flatter, push back and ask before committing.
2. **Skill Discovery block placement** — The spec says "between `# How You Work` and Step 1". If a given agent's structure makes that awkward, choose the most natural location and document the decision in the implementation summary.
3. **Inline anti-pattern examples in orchestrator** — there are ~6 separate examples (lines 56–67 and 727–749). They follow the same pattern. Apply the rewrite consistently across all of them.
4. **README "Skill Awareness" section** — write 2 short paragraphs. Keep it brief; the curated list will land later.

## Implementation Constraints (non-negotiable)

1. **Read each agent file fully before editing.** These prompts have voice and structure that must be preserved.
2. **Match the existing markdown style** — escape patterns, header levels, bullet style. Several files use `\#\#` escaping; preserve it where present.
3. **Do not commit, do not push, do not bump version.** Marcelo handles git.
4. **Do not add an ADR.** User explicitly opted out.
5. **Do not invent skill names** in any prompt or in the README. Use capability descriptions only.
6. **Do not change `src/`, `package.json`, `tsup.config.ts`, build scripts, or CI/CD configs.**
7. **Run all six verification checks** in Test Strategy before declaring done.

## Implementation Summary template (for the Implementer to fill in at the end)

```markdown
## Implementation Summary

### Files Modified
- agents/architect.agent.md       — [bullet list of changes]
- agents/implementer.agent.md     — [bullet list]
- agents/code-reviewer.agent.md   — [bullet list]
- agents/rubber-duck.agent.md     — [bullet list]
- agents/orchestrator.agent.md    — [bullet list]
- README.md                       — [bullet list]

### Files Created
(none)

### Build Status
- Spring-leakage grep: [pass/fail with command output]
- Skill-awareness grep: [pass/fail]
- Branch-agnostic grep: [pass/fail]
- pnpm build: [pass/fail]
- verify-agents.mjs (if present): [pass/fail]
- Issue #9 acceptance checklist: [N/N items satisfied]

### Notes for Code Reviewer
- [Any deviations from the spec, voice-preservation calls, or open questions]
- [Specifically flag any section where the rewrite changed the agent's tone]
```
