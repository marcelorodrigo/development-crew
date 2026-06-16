# Development Crew

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub tag](https://img.shields.io/github/v/tag/marcelorodrigo/development-crew?label=version)](https://github.com/marcelorodrigo/development-crew/tags)

_Four specialists that don't just write code: they think about it, they challenge you, they design it, build it, and hold it accountable._

**A skills-first development workflow** · Four specialist skills · On-demand · Pipeline-native · Bootstrap-injected orientation

---

## For LLM Agents

Paste this into any coding agent to install and configure Development Crew:

```
Install and configure by following the instructions here:
https://raw.githubusercontent.com/marcelorodrigo/development-crew/master/README.md
```

---

## The Pipeline

**Development Crew** is a pipeline-first workflow where four specialist skills coordinate structured software development from idea to reviewed code.

You start with a rough idea and end with reviewed, production-ready code: each specialist handing off to the next like a relay race, each one knowing exactly what to expect from the previous and what to produce for the next.

```mermaid
flowchart LR
    RD["🦆 Rubber Duck"] -->|Brainstorm Brief| AR["🏛️ Architect"]
    AR -->|Architecture Spec| IM["🔨 Implementer"]
    IM -->|Implementation Summary| CR["🔍 Code Reviewer"]
    CR -->|Code Review| End["✓ Reviewed Code"]
    
    style RD fill:#f9f,stroke:#333
    style AR fill:#bbf,stroke:#333
    style IM fill:#fbf,stroke:#333
    style CR fill:#fbb,stroke:#333
```

### How to Work the Pipeline

You can work the pipeline three ways:

**1. Manual Handoffs (Recommended for Learning)**

Move through the pipeline manually, reviewing artifacts at each stage:

1. Start with **Rubber Duck**: describe your idea, challenge assumptions
   - Takes: User request or vague idea
   - Produces: **Brainstorm Brief**

2. Load **Architect**: formalize the design
   - Takes: Brainstorm Brief
   - Produces: **Architecture Spec**

3. Load **Implementer**: write production code
   - Takes: Architecture Spec
   - Produces: **Implementation Summary**

4. Load **Code Reviewer**: validate the implementation
   - Takes: Implementation Summary + code changes
   - Produces: **Code Review** with approval/feedback

**2. Sequential Skills (Fastest for Routine Tasks)**

Load skills back-to-back without manual approval gates between steps. Each skill output feeds directly into the next skill's input.

**3. Entry at Any Point**

You don't have to start at the Rubber Duck:

- **Have a clear direction?** Skip Rubber Duck, start with Architect
- **Have a spec already?** Jump straight to Implementer
- **Want to review existing code?** Start with Code Reviewer
- **Need brainstorming?** Start with Rubber Duck

The pipeline is the recommended path, but each skill works independently.

---

## Quick Start

### opencode

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

Then use the `skill` tool to load any specialist:

```bash
skill: rubber-duck
```

### Claude Code

**Step 1** - Add the Development Crew marketplace:

```bash
claude plugin marketplace add marcelorodrigo/development-crew
```

**Step 2** - Install the plugin:

```bash
claude plugin install development-crew@development-crew-plugin
```

**Step 3** - Verify and use:

```bash
/skill rubber-duck
# or load any of: architect, implementer, code-reviewer
```

### GitHub Copilot

**Step 1** - Add the Development Crew marketplace:

```bash
copilot plugin marketplace add marcelorodrigo/development-crew
```

**Step 2** - Install the plugin:

```bash
copilot plugin install development-crew@development-crew-plugin
```

**Step 3** - Verify and use:

```bash
/skill rubber-duck
# or load any of: architect, implementer, code-reviewer
```

---

## Meet the Crew

### Rubber Duck: The Sparring Partner

_It was born in the silence before the first commit, in the moment when every developer stares at the screen and asks: "Is this actually the right problem?" The Rubber Duck has sat beside a thousand architects at that moment. It asks the questions nobody else will. It has no ego, no agenda, only the relentless drive to make sure the right thing gets built, for the right reason, before a single line of code is written._

**Role:** `Brainstorming · Assumption-challenging · Solution-space widening`

**Invoke when:**

- You have a vague idea and need to think it through
- You want to challenge your own assumptions before committing to an approach
- You need to explore trade-offs between multiple valid solutions
- You are about to start something new and want to stress-test the idea first

**Produces:** A structured **Brainstorm Brief** with problem statement, explored options, recommendation, and open questions for the Architect.

---

### Architect: The Blueprint Master

_The Architect has watched a thousand patterns emerge from a thousand codebases, the elegant ones and the ones that haunt teams for years. It does not offer menus of architectural styles or ask what you prefer. It applies the style appropriate to the project's tech stack and any loaded skills. It names every class, places every file, and defines every boundary before the Implementer writes the first line. Vagueness is its enemy. Precision is its craft._

**Role:** `Architecture design · Package structure · API contracts · Error handling strategy`

**Invoke when:**

- After a Rubber Duck brainstorming session has produced a Brainstorm Brief
- When you need to formalize a feature or component design before coding
- When you want exact class names, package paths, and API contracts decided upfront

**Produces:** A precise, buildable **Architecture Spec** with component design, project structure, data flow, error handling, and test strategy.

**Pipeline values enforced:**

- No implementation without a spec
- Validated handoffs between phases
- No merge without review
- Skills override generics: stack-specific conventions come from loaded skills, not from the agents themselves
- Be concrete: name every component, every contract

---

### Implementer: The Builder

_The Implementer is what happens when discipline becomes instinct. It has read the spec. It has explored the codebase. It knows how the existing team writes code, the language idioms, the test naming conventions, the assertion libraries. It does not add features that weren't asked for. It does not cut corners on tests. It writes code that looks like it was written by the same human who wrote the rest of the project. Then it runs the build, and it does not stop until it passes._

**Role:** `Production code · Tests · Build verification · Convention matching`

**Invoke when:**

- After the Architect has produced an Architecture Spec
- When you need to implement a feature, component, or fix based on a clear design

**Produces:** Working, tested, buildable code + an **Implementation Summary** with created/modified files, build status, and notes for the Code Reviewer.

---

### Code Reviewer: The Last Gate

_Nothing ships past the Code Reviewer without earning it. It diffs against the default branch first, always. It validates against the Architecture Spec, project conventions, and any loaded skills. It is not here to comment on formatting. It is here to find the bugs, the missed edge cases, the architectural violations, the tests that don't actually test anything. It is also the first to acknowledge clean, well-built code. It has seen enough bad code to recognize, and respect, the good._

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

Development Crew skills are **skill-aware**. When skills are available in your environment (e.g., via the OpenCode skill tool or platform skill-loading mechanisms), the Architect, Implementer, Code Reviewer, and Rubber Duck will detect your project's tech stack and load matching skills before starting work. This means they adapt their guidance, conventions, and review checklists to the specific frameworks and languages in use, without any manual configuration.

When no stack-specific skills are available, the skills fall back to general best practices and the project's own conventions.

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

### Load skills on demand

The plugin is skills-first, meaning all four specialist skills are discovered and loaded on-demand via the `skill` tool:

```bash
skill: architect
skill: implementer
skill: code-reviewer
skill: rubber-duck
```

There is no static agent configuration. Each skill is discovered from the `skills/` directory when you invoke it.

### Override model per skill (opencode)

You can configure model overrides in your `opencode.json` if you use the built-in agent system (not recommended—use skills instead):

```json
{
  "agent": {
    "dc:architect": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "dc:implementer": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "dc:code-reviewer": {
      "model": "anthropic/claude-sonnet-4-6"
    },
    "dc:rubber-duck": {
      "model": "anthropic/claude-opus-4-6"
    }
  }
}
```

**Note:** The plugin now uses skills, not hardcoded agents. This configuration is for backward compatibility only if you wish to layer agents on top.

---

## Updating

### opencode

Re-run the install command to get the latest version:

```bash
opencode plugin @marcelorodrigo/opencode-development-crew --global
```

Or update the package version in your `opencode.json` manually.

### Claude Code

```bash
claude plugin update development-crew@development-crew-plugin
```

### GitHub Copilot

```bash
copilot plugin update development-crew
```

---

## Uninstalling

### opencode

Remove the plugin entry from your `opencode.json`:

```json
{
  "plugin": []
}
```

Or if installed globally, remove `@marcelorodrigo/opencode-development-crew` from `~/.config/opencode/opencode.json`.

### Claude Code

```bash
claude plugin uninstall development-crew@development-crew-plugin
```

### GitHub Copilot

```bash
copilot plugin uninstall development-crew
```

To also remove the marketplace:

```bash
copilot plugin marketplace remove development-crew-plugin
```

---

## License

MIT. See [LICENSE](LICENSE).
