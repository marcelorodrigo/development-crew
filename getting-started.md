# Development Crew — Usage Manual

A short guide to **getting work done** with the crew. This is not a substitute for the [README](README.md) — it complements it by walking through the three flows developers actually use day-to-day.

All three flows produce the same on-disk artifact: an OpenSpec change at `openspec/changes/<change-name>/`. They differ only in how much the user steers along the way.

> **Tip:** Pick the flow that matches the *risk* of the change, not your mood. Big features → Manual. Well-scoped work → Semi-auto. Routine fixes → Auto.

---

## Flow 1 — Manual: maximum control, chat-driven

Use this when the problem is fuzzy, the stakes are high, or you want to argue with the agents before any code lands.

### 1. Brainstorm with the Rubber Duck

Select `rubber-duck` in opencode and open with a short problem statement or Jira ticket:

```
JIRA-482: users report duplicate notifications after retry
```

Chat freely — the Rubber Duck will challenge assumptions, surface options, and ask the questions you'd rather skip. When the exploration feels done, ask for the artifact explicitly:

```
Create a brainstorm brief for follow-up
```

It will emit a structured **Brainstorm Brief** (problem, options, recommendation, open questions) right in the conversation.

### 2. Hand off to the Architect

Switch the agent selector to `architect`. The Rubber Duck's brief is already in the conversation, so prompt:

```
Take the brainstorm brief above and create a spec
```

If this work follows up on something already merged, add a predecessor line on the same prompt:

```
Take the brainstorm brief above and create a spec.
predecessor: 2026-05-18-recover-trailing-final-response-json
```

The Architect explores the repo, makes binding decisions, and writes the change to `openspec/changes/<name>/` (proposal, design, tasks, capability specs). Review the spec on disk. If something is off, keep chatting with the Architect — it will revise the change in place.

### 3. Implement with the Orchestrator (semi-auto)

Once the spec looks right, switch to `orchestrator` and kick off the build loop:

```
mode: semi-auto, continue working on "fix-duplicate-notifications" change
```

The Orchestrator runs Implementer → Code Reviewer → Architect sign-off in a loop (capped by `iteration_cap`, default 5) until SHIP, FAIL, or the cap is hit.

**If the loop exhausts the iteration cap** without shipping, just tell the orchestrator:

```
continue with the implementation
```

It will resume from where it left off.

### 4. Review, then archive

When the orchestrator reports SHIP, **read the diff yourself** before archiving. If anything is wrong — code, test quality, or the structure of the change itself — stay in the orchestrator and describe what needs to change:

```
The retry handler duplicates state with NotificationStore. Re-do that part — it should reuse the existing dedupe set.
```

The orchestrator routes this to the Architect (which decides: code-only fix, design edit, requirement edit, or too-divergent), then kicks off a fresh implementation loop.

Once you're happy:

1. Archive the change (orchestrator can do this — just ask: `archive the change`).
2. Commit, push, and open the PR. The orchestrator session is a fine place to do this — it has full context for the commit message and PR body.

---

## Flow 2 — Semi-auto: orchestrator from the start

Use this when you don't need a deep chat with the Rubber Duck, but still want to approve the spec before code lands.

### 1. Start with the Orchestrator

Select `orchestrator` and describe the task:

```
JIRA-501: add a /healthz endpoint that checks DB and Redis connectivity
```

The orchestrator runs Rubber Duck and Architect on your behalf, pausing at each gate so you can review the Brainstorm Brief and the OpenSpec change. Feedback here is **single-turn**, not chat-like — you approve, send feedback (the orchestrator routes it to the Architect for triage), or reject.

### 2. Graduate to semi-auto at the Architect gate

When the Architect gate fires, choose the **"approve and graduate to semi-auto"** option. From there the build loop (Implementer → Reviewer → Architect sign-off) runs without further prompts.

### 3. Same close-out as Flow 1

Review the final diff yourself. If something needs another pass, tell the orchestrator. When you're happy: archive, commit, push, PR.

---

## Flow 3 — Full auto: hands-off

Use this only for **simple, low-risk** work: small fixes, mechanical refactors, log additions, a single new endpoint with obvious shape.

### Start the Orchestrator in autonomous mode

```
mode: auto
JIRA-612: add structured logging to PaymentService.refund()
```

The orchestrator drives the entire pipeline end-to-end: Rubber Duck → Architect → Implementer → Reviewer → Architect sign-off, no gates. The Architect's sign-off (capped by `iteration_cap`, default 5) is the only quality gate.

**One important difference:** autonomous mode **does not archive** the change automatically when you started from a Jira ticket — it stops at SHIP and waits. This is intentional: it gives you a chance to inspect the final result before it lands in `openspec/changes/archive/`. After your review, archive, commit, push, and open the PR.

If the loop fails (validation errors, iteration cap exhausted), the orchestrator aborts with a `failed_quality_gate` report. Drop back into Flow 1 or 2 to recover — usually the spec needs human judgment.

---

## Cross-cutting tips

- **`PROJECT_CONTEXT.md`** is generated once by the Repo Scout (or auto-invoked by the orchestrator on first run). Regenerate it after a stack change with `refresh_context: true`.
- **Predecessor for follow-ups.** PR-review fixes, post-merge bugs, and follow-up tickets should pass `predecessor: <archived-change-name>` so the new change is grounded in the merged work.
- **The change name is the handoff token.** Once a change exists at `openspec/changes/<name>/`, you can drop into any agent at any time by passing the change name — you don't need to replay the conversation.
- **Don't skip the human review of the diff.** Even in semi-auto and auto modes, the Architect signs off on *compliance with the spec*, not on whether the spec was the right one. That part is still on you.
