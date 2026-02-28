---
description: Identify knowledge gaps in CLAUDE.md that require human input
argument-hint: "[path-to-claude-md]"
allowed-tools: Bash, Read, Task, AskUserQuestion, Write, Edit
---

Invoke the ce:context-auditor agent to identify knowledge gaps in project documentation and guide the user through filling them.

## Workflow

### 1. Locate CLAUDE.md

**If `$ARGUMENTS` is provided:**
- Use the provided path to CLAUDE.md

**If `$ARGUMENTS` is empty:**
- Check for `CLAUDE.md` in current directory
- Check for `CLAUDE.md` in project root (if in subdirectory)
- If not found, inform user and ask if they want to create one from scratch

### 2. Invoke Context Auditor

Launch the ce:context-auditor agent with this task:

```
Analyze the codebase and [existing CLAUDE.md if present] to identify knowledge gaps that require human input.

Your task:
1. Read CLAUDE.md if it exists - identify what's already well documented
2. Explore the codebase to understand: project structure, dependencies, frameworks, configuration, tests
3. Identify high-impact knowledge gaps across these categories:
   - Business context (why this exists, who uses it, what problem it solves)
   - Architectural rationale (why tech choices were made)
   - External integrations (API behaviors, auth flows, quirks)
   - Domain logic (business rules not obvious from code)
   - Known issues & technical debt
   - Team conventions (PR process, branching, testing philosophy)
   - Development environment (setup gotchas, debugging tips)

4. Present 5-7 targeted questions about the most critical gaps
5. After receiving answers, ask 2-3 follow-up questions if needed (max 2 rounds of questions)
6. Generate enhanced CLAUDE.md sections with the provided context
7. If CLAUDE.md exists, merge new sections with existing content (preserve what's there)
8. Mark human-provided context with `<!-- Added via context-auditor -->` comments

Focus on knowledge that:
- Can't be deduced from reading the code
- Would cause real friction if missing
- Is specific and actionable (not theoretical)

Skip anything that's:
- Already well documented
- Obvious from code structure
- Standard framework knowledge
```

### 3. After Agent Completes

The agent will have:
- Asked the user questions and collected answers
- Generated new CLAUDE.md sections based on those answers
- Either created a new CLAUDE.md or prepared an enhanced version

**If CLAUDE.md already existed:**
- The agent will present the updated sections
- Review the changes and merge them into CLAUDE.md using the Edit tool
- Preserve all existing content
- Confirm the update with the user

**If creating new CLAUDE.md:**
- The agent will generate initial documentation from code analysis
- Combined with human-provided context from the Q&A
- Write the complete CLAUDE.md file
- Confirm the creation with the user

### 4. Final Output

Present a summary:
```markdown
## Context Audit Complete

**Gaps identified:** [count] critical areas
**Questions asked:** [count] questions across [count] rounds
**Documentation added:** [list of new sections]

**Updated file:** `[path]/CLAUDE.md`

The following areas now have human-provided context:
- [Category 1]: [brief description]
- [Category 2]: [brief description]

Run `/ce:audit-context` again anytime to identify new knowledge gaps.
```

## Notes

- This command is interactive - it will ask the user questions
- The agent respects user time: maximum 5-7 questions per round, 2 rounds maximum
- Users can skip questions or answer "I don't know" - partial information is valuable
- The agent won't ask about things that are obvious from code or already documented
- Generated content is marked with comments so it's clear what came from human input vs code analysis
