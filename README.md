# Development Crew

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub tag](https://img.shields.io/github/v/tag/marcelorodrigo/development-crew?label=version)](https://github.com/marcelorodrigo/development-crew/tags)

_Four specialists that don't just write code: they think about it, they challenge you, they design it, build it, and review it._

**A four-skill AI development crew** · Multi-harness · Skill-aware · Process-disciplined · Production-ready

---

## Quick Start

Development Crew works across multiple harnesses. Choose your platform:

### OpenCode

**One-liner install (global):**

```bash
opencode plugin @marcelorodrigo/opencode-development-crew --global
```

Or add manually to your `opencode.json`:

```json
{
  "plugin": [
    "@marcelorodrigo/opencode-development-crew"
  ]
}
```

**Then:** Reference `AGENTS.md` in your project for the workflow (or ask any specialist what Development Crew is).

### Codex CLI

Development Crew is available as SKILL.md files. Install to your project:

```bash
# Option 1: Global installation
mkdir -p ~/.codex/skills
cp -r skills/* ~/.codex/skills/

# Option 2: Project-level installation
mkdir -p .codex/skills
cp -r skills/* .codex/skills/
```

**Then:** Read `AGENTS.md` in your project for the workflow.

### Pi

Development Crew skills are in the `skills/` directory and are automatically discovered. Install by cloning or copying the repository's `skills/` folder into your Pi `skills/` directory.

**Then:** Reference `AGENTS.md` in your project for the workflow.

### Claude Code

Coming in a future release (Issue #107).

### GitHub Copilot CLI

Coming in a future release (Issue #108).

### Hermes

Coming in a future release (Issue #109).

---

## The Workflow

**Development Crew** works best as a pipeline.

You start with a rough idea and end with reviewed, production-ready code: each specialist handing off to the next like a relay race, each one knowing exactly what to expect from the previous and what to produce for the next.

```
vague idea
    ↓
[Rubber Duck] → Brainstorm Brief
    ↓
[Architect] → Architecture Spec
    ↓
[Implementer] → Code + Implementation Summary
    ↓
[Code Reviewer] → Review findings + approval
    ↓
ready to merge
```

### How to Work

1. Start a conversation with the **Rubber Duck**: describe your idea, even if half-baked. The Rubber Duck will ask sharp questions, challenge your assumptions, and widen your thinking before you commit to anything. When the thinking is done, it produces a **Brainstorm Brief** right there in the conversation.

2. Take that output and open a new session with the **Architect**. The Architect reads the brief, explores your codebase, makes every binding technical decision: class names, package paths, API contracts, error handling, and produces an **Architecture Spec**.

3. Take that spec to the **Implementer**. The Implementer reads the spec, matches your codebase's conventions, writes production code with tests, runs the build, and produces an **Implementation Summary** with everything the reviewer needs to know.

4. Take that to the **Code Reviewer**. The Code Reviewer diffs against the default branch, validates the implementation against the spec and project conventions, and delivers a categorized review. Nothing ships past it without earning it.

### You can also enter at any stage

- **Already know the direction?** Skip the Rubber Duck and start with the Architect.
- **Already have a spec?** Hand it straight to the Implementer.
- **Want an expert eye on existing code?** Send it directly to the Code Reviewer (with or without an Architecture Spec).
- **Small change or bug fix?** Go straight from problem statement to Implementer if the scope is clear.

The pipeline is the recommended path, but each specialist stands on its own.

---

## Meet the Specialists

For detailed information about each specialist, see `AGENTS.md` in your project. Below is a brief overview.

### Rubber Duck: The Sparring Partner

**Role:** `Brainstorming · Assumption-challenging · Solution-space widening`

**Invoke when:**

- You have a vague idea and need to think it through
- You want to challenge your own assumptions before committing to an approach
- You need to explore trade-offs between multiple valid solutions

**Produces:** A structured **Brainstorm Brief** with problem statement, explored options, recommendation, and open questions for the Architect.

---

### Architect: The Blueprint Master

**Role:** `Architecture design · Package structure · API contracts · Error handling strategy`

**Invoke when:**

- After a Rubber Duck brainstorming session has produced a Brainstorm Brief
- When you need to formalize a feature or component design before coding
- When you want exact class names, package paths, and API contracts decided upfront

**Produces:** A precise, buildable **Architecture Spec** with component design, project structure, data flow, error handling, and test strategy.

---

### Implementer: The Builder

**Role:** `Production code · Tests · Build verification · Convention matching`

**Invoke when:**

- After the Architect has produced an Architecture Spec
- When you need to implement a feature, component, or fix based on a clear design

**Produces:** Working, tested, buildable code + an **Implementation Summary** with created/modified files, build status, and notes for the Code Reviewer.

---

### Code Reviewer: The Last Gate

**Role:** `Architecture compliance · Bug detection · Security · Test quality · Read-only`

**Invoke when:**

- After the Implementer has completed an implementation
- When you want to validate code changes before merging
- When you want a critical review of existing code against best practices

**Review categories:**

- **Critical**: Must fix before merge. Bugs, security issues, architectural violations.
- **Important**: Should fix. Deviations from spec, missing tests, incorrect patterns.
- **Suggestion**: Nice to have. Non-blocking improvements.

**Produces:** A **Code Review** report with findings categorized by severity, a "What's Done Well" section, and a final verdict: Approve · Approve with comments · Request changes.

---

## Skill Awareness

Development Crew specialists are **skill-aware**. When skills are available in the user's environment (e.g., via an `<available_skills>` block or a platform skill-loading tool), the Architect, Implementer, Code Reviewer, and Rubber Duck will detect the project's tech stack and load matching skills before starting work. This means the specialists adapt their guidance, conventions, and review checklists to the specific frameworks and languages in use, without any manual configuration.

When no skills are available, specialists fall back to the model's built-in knowledge and the project's own conventions.

### Recommended skills per tech stack

#### Every workflow (universal)

These two skills improve output quality in any pipeline run, regardless of stack:

| Capability | Skill | Source |
|---|---|---|
| Conventional commit messages | [`conventional-commit`](https://skills.sh/marcelorodrigo/agent-skills/conventional-commit) | marcelorodrigo |
| Pull request authoring | [`create-pr`](https://skills.sh/marcelorodrigo/agent-skills/create-pr) | marcelorodrigo |

---

#### Vue / Nuxt Frontend

**Core (any Vue/Nuxt project):**

| Capability | Skill | Install |
|---|---|---|
| Vue 3 API | [`vue-skilld`](https://skills.sh/skilld-dev/vue-ecosystem-skills/vue-skilld) | [skilld-dev/vue-ecosystem-skills](https://skills.sh/skilld-dev/vue-ecosystem-skills) · Harlan Zw |
| State management | [`pinia-skilld`](https://skills.sh/skilld-dev/vue-ecosystem-skills/pinia-skilld) | skilld-dev |
| Routing API | [`vue-router-skilld`](https://skills.sh/skilld-dev/vue-ecosystem-skills/vue-router-skilld) | skilld-dev |
| Nuxt framework | [`nuxt`](https://skills.sh/antfu/skills/nuxt) | [antfu/skills](https://skills.sh/antfu/skills) · Vue/Vite/Nuxt core team |
| Build tool | [`vite`](https://skills.sh/antfu/skills/vite) | antfu |
| Test framework | [`vitest`](https://skills.sh/antfu/skills/vitest) | antfu |
| Package manager | [`pnpm`](https://skills.sh/antfu/skills/pnpm) | antfu |
| Vue patterns | [`vue-best-practices`](https://skills.sh/vuejs-ai/skills/vue-best-practices) | [vuejs-ai/skills](https://skills.sh/vuejs-ai/skills) · eval-validated |
| Routing patterns | [`vue-router-best-practices`](https://skills.sh/vuejs-ai/skills/vue-router-best-practices) | [vuejs-ai/skills](https://skills.sh/vuejs-ai/skills) · eval-validated |

> **Note:** Nuxt has no official framework skill. The `nuxt.com/mcp` and `ui.nuxt.com/mcp` MCP servers are a lower-token alternative for live Nuxt docs.

**Testing + composables (strongly recommended):**

| Capability | Skill | Install |
|---|---|---|
| Component testing patterns | [`vue-testing-best-practices`](https://skills.sh/antfu/skills/vue-testing-best-practices) | [vuejs-ai/skills](https://skills.sh/vuejs-ai/skills) |
| Vue Test Utils API | [`vue-test-utils-skilld`](https://skills.sh/skilld-dev/vue-ecosystem-skills/vue-test-utils-skilld) | [skilld-dev/vue-ecosystem-skills](https://skills.sh/skilld-dev/vue-ecosystem-skills) |
| E2E testing | [`playwright-best-practices`](https://github.com/currents-dev/playwright-best-practices) | [currents-dev](https://github.com/currents-dev/playwright-best-practices) · 33.4K installs |
| Composable utilities | [`vueuse-functions`](https://skills.sh/vueuse/skills/vueuse-functions) | [vueuse/skills](https://skills.sh/vueuse/skills) · official VueUse org |

**Situational (install what you need):**

- **UI libraries:** [skilld-dev](https://skills.sh/skilld-dev/vue-ecosystem-skills) has `reka-ui-skilld`, `shadcn-vue-skilld`, `primevue-skilld`, `vuetify-skilld`, `quasar-skilld`
- **Nuxt UI:** [`nuxt-ui`](https://skills.sh/nuxt/ui/nuxt-ui) from [nuxt/ui](https://skills.sh/nuxt/ui) (official, 12.9K installs)
- **Nuxt modules:** [onmax/nuxt-skills](https://skills.sh/onmax/nuxt-skills) has `nuxt-content`, `nuxthub`, `nuxt-seo` (auto-regenerated weekly)
- **Forms / i18n:** skilld-dev has `formkit-core-skilld`, `vee-validate-skilld`, `vue-i18n-skilld`
- **Vue debugging:** [vuejs-ai](https://skills.sh/vuejs-ai/skills) has `vue-debug-guides`, `vue-pinia-best-practices`
- **Web quality:** [addyosmani/agent-skills](https://skills.sh/addyosmani/agent-skills) has [`performance-optimization`](https://skills.sh/addyosmani/agent-skills/performance-optimization), [`browser-testing-with-devtools`](https://skills.sh/addyosmani/agent-skills/browser-testing-with-devtools)

---

#### General Frontend & Cross-Stack

| Category | Skill | Install | Credibility |
|---|---|---|---|
| TypeScript | [`typescript-advanced-types`](https://skills.sh/wshobson/agents/typescript-advanced-types) | [wshobson/agents](https://skills.sh/wshobson/agents) | Best available |
| Cypress | [`cypress-author`](https://skills.sh/cypress-io/ai-toolkit/cypress-author) + [`cypress-explain`](https://skills.sh/cypress-io/ai-toolkit/cypress-explain) | [cypress-io/ai-toolkit](https://skills.sh/cypress-io/ai-toolkit) · official | Best available |
| Accessibility | [`accessibility`](https://skills.sh/addyosmani/web-quality-skills/accessibility) | [addyosmani/web-quality-skills](https://skills.sh/addyosmani/web-quality-skills) · Google Chrome | Strong |
| Monorepo (Turborepo) | [`turborepo`](https://skills.sh/vercel/turborepo/turborepo) | [vercel/turborepo](https://skills.sh/vercel/turborepo) · official | Strong |
| Monorepo (Nx) | Nx suite | [nrwl/nx](https://skills.sh/nrwl/nx) · official | Strong |
| CSS / Tailwind | [`tailwind-design-system`](https://skills.sh/wshobson/agents/tailwind-design-system) | [wshobson/agents](https://skills.sh/wshobson/agents) | Best available |
| GraphQL | [`graphql-schema`](https://skills.sh/apollographql/skills/graphql-schema) + [`graphql-operations`](https://skills.sh/apollographql/skills/graphql-operations) | [apollographql/skills](https://skills.sh/apollographql/skills) · official | Strong |
| Performance | [`performance-optimization`](https://skills.sh/addyosmani/agent-skills/performance-optimization) | [addyosmani/agent-skills](https://skills.sh/addyosmani/agent-skills) · Google Chrome | Strong |
| Node.js (Fastify) | [`fastify-best-practices`](https://skills.sh/mcollina/skills/fastify-best-practices) | [mcollina/skills](https://skills.sh/mcollina/skills) · Fastify creator | Strong |
| Node.js (Hono) | [`hono`](https://skills.sh/yusukebe/hono-skill/hono) | [yusukebe/hono-skill](https://skills.sh/yusukebe/hono-skill) · Hono creator | Strong |
| Docker / CI | [`docker-development`](https://skills.sh/wshobson/agents/docker-development) + [`cicd-automation`](https://skills.sh/wshobson/agents/cicd-automation) | [wshobson/agents](https://skills.sh/wshobson/agents) | Best available |

**Known gaps** (no quality skill exists as of research date): TypeScript from the TS team, Vue Apollo / `@vue/apollo-composable`, Tailwind v4 from Tailwind Labs, Docker from Docker org, GitHub Actions from GitHub, NestJS, tRPC.

---

#### Spring Boot / Java

| Capability | Skill | Install |
|---|---|---|
| Testing (JUnit, AssertJ, Mockito) | [`spring-boot-testing`](https://skills.sh/marcelorodrigo/agent-skills/spring-boot-testing) | [marcelorodrigo/agent-skills](https://skills.sh/marcelorodrigo/agent-skills) |

> Spring Boot framework and Clean Architecture skills are under research. Contributions welcome.

---

## Configuration

### Override model per specialist (OpenCode)

You can override the model used for any specialist by configuring your `opencode.json`:

```json
{
  "agent": {
    "dc:rubber-duck": {
      "model": "anthropic/claude-opus-4-6"
    }
  },
  "skills": {
    "architect": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "implementer": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "code-reviewer": {
      "model": "anthropic/claude-sonnet-4-6"
    }
  }
}
```

---

## Updating

### OpenCode

Re-run the install command to get the latest version:

```bash
opencode plugin @marcelorodrigo/opencode-development-crew --global
```

Or update the package version in your `opencode.json` manually.

### Codex CLI

Re-run the installation command from the Quick Start section to get the latest version.

### Pi

Update your `skills/` directory with the latest version from the repository.

---

## Uninstalling

### OpenCode

Remove the plugin entry from your `opencode.json`:

```json
{
  "plugin": []
}
```

Or if installed globally, remove `@marcelorodrigo/opencode-development-crew` from `~/.config/opencode/opencode.json`.

### Codex CLI

Remove the `~/.codex/skills/` or `.codex/skills/` directories containing Development Crew skills.

### Pi

Remove the `skills/` directory containing Development Crew skills from your Pi installation.

---

## License

MIT. See [LICENSE](LICENSE).
