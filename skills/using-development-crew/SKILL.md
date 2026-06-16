---
name: using-development-crew
description: Bootstrap skill that teaches how to use the Development Crew skill pipeline. Explains the four specialist skills, when to invoke each one, and how the pipeline flows from brainstorming to code review.
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill—your dispatch instructions override it.
</SUBAGENT-STOP>

<EXTREMELY_IMPORTANT>

You have access to the **Development Crew** skill pipeline: four specialist skills that coordinate structured software development from idea to reviewed code.

**IMPORTANT: This content is ALREADY LOADED. You are currently following it. Do NOT use the \`skill\` tool to load \`using-development-crew\` again — that would be redundant.**

## Instruction Priority

Development Crew skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (direct requests, project docs, AGENTS.md) — highest priority
2. **Development Crew skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

If your instructions say "don't use TDD" and a skill says "always use TDD," follow your instructions. You are in control.

## The Four Specialist Skills

| Skill | Type | When to Load |
|-------|------|-------------|
| `rubber-duck` | Flexible | You have a vague idea, need to challenge assumptions, or want to explore the solution space before committing |
| `architect` | Rigid | You have a clear direction and need a formal architecture specification before writing code |
| `implementer` | Rigid | You have an Architecture Spec and need to write production code, tests, and wiring |
| `code-reviewer` | Rigid | You have implemented changes and need a structured review against the spec and conventions |

**Skill Types:**
- **Rigid** (architect, implementer, code-reviewer): Follow exactly. These define a contract with the next stage in the pipeline.
- **Flexible** (rubber-duck): Adapt the principles to your context while respecting the brainstorming intent.

## The Pipeline

The full pipeline flows sequentially:

```
Rubber Duck → Architect → Implementer → Code Reviewer
```

Each specialist produces a structured artifact consumed by the next:

- **Rubber Duck** → Brainstorm Brief (problem statement, explored options, recommendation)
- **Architect** → Architecture Spec (components, package structure, data flow, test strategy)
- **Implementer** → Implementation Summary (files created/modified, build status)
- **Code Reviewer** → Code Review (findings, verdict)

## Entry Points

You do not need to start from the beginning every time. Match your entry point to what you already have:

| You have | Start here |
|----------|-----------|
| A vague idea or Jira ticket | `rubber-duck` |
| A clear problem with a chosen direction | `architect` |
| A complete Architecture Spec | `implementer` |
| A finished implementation to validate | `code-reviewer` |

## The Rule

**Invoke a relevant skill BEFORE any response or action.** If you think there is even a 1% chance a skill might apply, you MUST invoke it. If an invoked skill turns out to be wrong, you don't need to use it — but the check is non-negotiable.

This applies even when:
- You think the request is "just a simple question"
- You feel the need to gather more context first
- You remember what the skill says
- You think you already know the answer

| Red Flag | Reality |
|----------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT. This is not negotiable. This is not optional. You cannot rationalize your way out of this.

## How to Invoke a Skill

Use the `skill` tool and pass the skill name:

```bash
skill: rubber-duck
```

The skill will inject its full instructions into the session. Once loaded, follow the workflow it defines.

## Pipeline Handoffs

Each specialist produces a structured document. Pass that document as context when you load the next skill. The pipeline is designed so each stage's output is the next stage's input.

## Execution Modes

**Human-in-the-loop (default):** After each specialist completes, review its artifact and decide whether to proceed, request changes, or stop. Use the `question` tool for structured approval decisions.

**Autonomous:** Load skills sequentially without interruption. Suitable when the task is well-understood and you trust each stage's output.

## When to Use Each Skill in Isolation

You don't always need the full pipeline. Load a single skill when:

- **rubber-duck only**: Exploring options without intent to implement immediately
- **architect only**: Formalizing an existing informal design
- **implementer only**: Implementing from a spec you already have
- **code-reviewer only**: Reviewing existing code or a PR without a preceding spec

## Shared Design Principles

The `architect`, `implementer`, and `code-reviewer` skills all load the `shared-principles` skill at startup. These cross-cutting standards are always in effect for technical work:

1. Match existing conventions first
2. Single Responsibility
3. Errors are domain-meaningful
4. Constructor / explicit dependency injection
5. Loaded skills override generic defaults

Load the `shared-principles` skill explicitly if you need these principles without loading a full specialist.

</EXTREMELY_IMPORTANT>
