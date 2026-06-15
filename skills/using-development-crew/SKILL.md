---
name: using-development-crew
description: Bootstrap skill that teaches agents when to invoke the four specialist DC skills (Rubber Duck, Architect, Implementer, Code Reviewer) and how to chain them together in the development workflow.
---

# The Development Crew Pipeline

The Development Crew provides four specialist agents that work together in a deliberate pipeline to take an idea from vague brainstorming all the way to reviewed, production-ready code.

## The Four Specialists

### 1. **dc:rubber-duck** — Brainstorming sparring partner

**When to use:** You have a vague idea, problem statement, or feature request. You want to think through the problem space before committing to a design.

**What it does:** Helps you explore trade-offs, challenge assumptions, and widen the solution space. Asks sharp questions. Produces a structured **Brainstorm Brief** when exploration is done.

**Time to use it:** Early, before any design or implementation.

**Output:** A Brainstorm Brief document containing:
- The problem statement
- Multiple explored options with trade-offs
- A recommendation
- Open questions for the Architect

---

### 2. **dc:architect** — Architecture formalizer

**When to use:** After you've completed brainstorming (have a Brainstorm Brief) or you have a clear direction for a feature. You need to formalize the design before coding.

**What it does:** Takes a brief or problem description and produces a detailed **Architecture Specification** with:
- Component breakdown
- Exact file/class placement
- API contracts
- Error handling strategy
- Test strategy
- Project context (conventions, existing patterns)

**Time to use it:** After brainstorming, before implementation.

**Output:** An Architecture Spec that the Implementer will use as a blueprint.

---

### 3. **dc:implementer** — Builder agent

**When to use:** You have an Architecture Spec from the Architect (or a clear design). You're ready to write code.

**What it does:** Implements the architecture specification exactly:
- Creates files and classes as specified
- Writes tests following the project's conventions
- Matches the existing codebase style
- Uses any available skills to write stack-specific code correctly
- Produces an Implementation Summary

**Time to use it:** After architecture is finalized.

**Output:** Working code, tests, and an Implementation Summary.

---

### 4. **dc:code-reviewer** — Code review specialist

**When to use:** After the Implementer has finished, or you want to review existing code against an Architecture Spec.

**What it does:** Validates implementations against:
- The Architecture Spec (if provided)
- Design principles and layer boundaries
- Project conventions and loaded skills
- Code quality and correctness

**Time to use it:** After implementation, before merge.

**Output:** A detailed code review with findings and recommendations.

---

## The Workflow

### Full Pipeline (ideal flow)

```
vague idea
    ↓
[dc:rubber-duck] → Brainstorm Brief
    ↓
[dc:architect] → Architecture Spec
    ↓
[dc:implementer] → Code + Implementation Summary
    ↓
[dc:code-reviewer] → Review findings + approval
    ↓
ready to merge
```

### Partial Pipelines

- **Skip brainstorming**: If you already have a clear direction, go directly to `dc:architect` and provide your design direction.
- **Skip architecture**: If you have a very small change or bug fix, you may go directly from problem statement to `dc:implementer`, but be explicit about what you want built.
- **Review only**: You can send existing code directly to `dc:code-reviewer` with or without an Architecture Spec.

---

## How to Use This Skill

1. **Identify which specialist you need** based on where you are in the workflow (above).
2. **Invoke the agent** using `@dc:<name>` (e.g., `@dc:rubber-duck`).
3. **Provide the required input** (Brainstorm Brief, Architecture Spec, code changes, etc.).
4. **Receive the output** and pass it to the next specialist in the pipeline, or use it directly.

---

## Key Principles

- **Deliberate sequencing**: Each agent is optimized for one job. Don't skip steps unless you have a good reason.
- **Clear handoffs**: Each agent's output becomes the next agent's input. Clarity at handoff points prevents rework.
- **Transparency**: Agents will state their assumptions and flag gaps. Answer their questions before they proceed.
- **Skill integration**: All agents load and follow stack-specific skills for your project. Lean on them.
- **No hand-waving**: Architecture specs are precise (file locations, class names, boundaries). Implementation specs are clear. Code reviews are detailed.

---

## Example: Adding a Feature

**You say:** "I want to add user authentication to the API."

**Step 1 — Brainstorm:**
```
@dc:rubber-duck
I want to add user authentication to our API. We're a REST service. I'm not sure whether to use JWT, session cookies, or OAuth.
```
→ Produces a Brainstorm Brief exploring those options.

**Step 2 — Architect:**
```
@dc:architect
Here's the Brainstorm Brief from Rubber Duck: [brief]. Design the auth layer.
```
→ Produces an Architecture Spec with user model, middleware placement, error types, tests to write.

**Step 3 — Implement:**
```
@dc:implementer
Here's the Architecture Spec from Architect: [spec]. Implement it.
```
→ Produces working code with tests and Implementation Summary.

**Step 4 — Review:**
```
@dc:code-reviewer
Here's what the Implementer built: [files]. Does it match the Architect's spec and our conventions?
```
→ Produces a detailed code review.

---

## When NOT to Use These Agents

- **Answering a quick question?** Use your preferred LLM or IDE assistant.
- **Debugging a single bug?** Use IDE debugging or `@general` for quick troubleshooting.
- **Writing documentation?** These agents are not optimized for docs; use a general-purpose agent.
- **Refactoring without architectural changes?** Consider `@code-reviewer` for validation, but these agents are design-heavy.
