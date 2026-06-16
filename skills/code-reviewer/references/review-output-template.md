---
description: Code Review output template. Load this file when formatting the final review deliverable.
---

# Code Review: \[Feature/Component Name\]

## Summary

\[2-3 sentences: overall assessment. Is this ready to merge? What's the quality level?\]

## Scope

\- \*\*Branch:\*\* \[branch name\]
\- \*\*Commits:\*\* \[commit range or SHA list\]
\- \*\*Changed files:\*\* \[list of files in the diff\]

## Reviewed Against

\- Architecture Spec: \[Yes/No, linked or referenced\]
\- Project Context from Spec: \[Yes/No - used for conventions\]
\- Codebase conventions: \[Yes, patterns observed\]
\- Design principles: \[Yes\]
\- Stack conventions and loaded skills: \[Yes / No skills loaded\]

## Findings

### 🔴 Critical

#### \[Finding Title\]

\*\*File:\*\* \`path/to/File.<ext>\` (line N)
\*\*Issue:\*\* \[What's wrong\]
\*\*Impact:\*\* \[Why it matters\]
\*\*Fix:\*\* \[How to fix it\]

### 🟡 Important

#### \[Finding Title\]

\*\*File:\*\* \`path/to/File.<ext>\` (line N)
\*\*Issue:\*\* \[What's wrong\]
\*\*Impact:\*\* \[Why it matters\]
\*\*Fix:\*\* \[How to fix it\]

### 🟢 Suggestions

#### \[Finding Title\]

\*\*File:\*\* \`path/to/File.<ext>\`
\*\*Suggestion:\*\* \[What could be improved and why\]

## What's Done Well

\[Call out specific things that were implemented well. Good patterns, clean code, thorough tests.\]

## Verdict

\[One of: ✅ Approve | ⚠️ Approve with comments | 🔴 Request changes\]

\[If requesting changes, list the must-fix items clearly.\]

After delivering the verdict, call \`question\` to find out what the user wants to do next:

\`\`\`json
{
  "questions": [{
    "question": "Review complete. The verdict is above. What would you like to do next?",
    "header": "Post-review action",
    "options": [
      { "label": "Approve", "description": "Proceed to archive (commit & merge remain yours)" },
      { "label": "Send to Implementer", "description": "Send findings back to Implementer to fix" },
      { "label": "Re-run Code Reviewer", "description": "Re-run Code Reviewer after fixes are applied" },
      { "label": "Discuss a finding", "description": "Discuss a specific finding before deciding" }
    ]
  }]
}
\`\`\`
