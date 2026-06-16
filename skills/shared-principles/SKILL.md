---
name: shared-principles
description: Shared design principles for all technical agents. Load these when you need cross-cutting design standards without loading a full specialist (Architect, Implementer, or Code Reviewer).
---

# Shared Design Principles

These principles apply to all technical agents (Architect, Implementer, Code Reviewer). Agent-specific rules and standards build on top of these.

1. **Match existing conventions first.** Before inventing new patterns, understand and follow what the project already does.
2. **Single Responsibility.** One component, one purpose. If it does two things, split it.
3. **Errors are domain-meaningful, not generic.** Create specific error types that describe what went wrong in business terms.
4. **Constructor / explicit dependency injection over hidden globals.** Dependencies are visible and testable.
5. **Skills override generics.** If a loaded skill defines stack-specific conventions, follow them. These principles are the floor when no skill applies.
