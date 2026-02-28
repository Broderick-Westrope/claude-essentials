---
description: Identify knowledge gaps in CLAUDE.md and collect human context
argument-hint: "[path-to-claude-md]"
allowed-tools: Bash, Read, Task, AskUserQuestion, Write, Edit
---

Analyze the codebase to identify documentation gaps, collect human knowledge interactively, and enhance CLAUDE.md with context that can't be inferred from code.

## Workflow

### Step 1: Locate CLAUDE.md

**If `$ARGUMENTS` is provided:**
- Use the provided path

**If `$ARGUMENTS` is empty:**
- Check `./CLAUDE.md`
- Check `../ CLAUDE.md` (if in subdirectory)
- Check `.claude/CLAUDE.md`

**If not found:**
- Ask user if they want to create one from scratch or specify path

### Step 2: Invoke Gap Analysis Agent

Launch the `ce:context-auditor` agent to analyze the codebase and existing documentation:

```
Analyze the codebase at ${PROJECT_ROOT} and identify knowledge gaps in documentation.

Read existing CLAUDE.md (if present) at: ${CLAUDE_MD_PATH}

Your task:
1. Explore codebase structure, dependencies, patterns, and configurations
2. Read existing CLAUDE.md to see what's already documented
3. Identify high-impact knowledge gaps across 7 categories:
   - Business Context (problem, users, workflows)
   - Architectural Rationale (tech choices, why)
   - External Integrations (APIs, auth, quirks)
   - Domain Logic (business rules, state machines)
   - Known Issues & Debt (limitations, gotchas)
   - Team Conventions (PR process, testing philosophy)
   - Development Environment (setup, debugging)

4. Output structured analysis with:
   - Summary of gaps by priority (critical/important/nice-to-have)
   - 5-7 specific recommended questions with code context
   - Suggested CLAUDE.md section structure

Focus on gaps that:
- Can't be deduced from reading code
- Would cause real onboarding friction
- Are specific and actionable

Your output will be parsed to extract questions for the user.
```

### Step 3: Parse Agent Output

Extract from the agent's structured output:
- The **Recommended Questions** section (numbered list 1-7)
- The **Suggested CLAUDE.md Structure** (section outline)
- The **Summary** (gap counts and priorities)

### Step 4: Present Gap Analysis to User

Show the user what the agent found:

```markdown
## Knowledge Gap Analysis

The agent identified ${COUNT} documentation gaps:
- ${CRITICAL_COUNT} critical (would block developers)
- ${IMPORTANT_COUNT} important (would cause confusion)

### Critical Gaps
${LIST_CRITICAL_GAPS}

### Important Gaps
${LIST_IMPORTANT_GAPS}

I'll now ask ${QUESTION_COUNT} questions to fill these gaps.
```

### Step 5: Collect Answers

Use `AskUserQuestion` to present each question from the agent's "Recommended Questions" list.

**For each question:**
- Show the category and full question with code context
- Allow user to provide detailed answers
- Allow user to skip questions ("Not applicable" or "I don't know")
- Track which questions were answered vs skipped

**Example AskUserQuestion usage:**
```json
{
  "questions": [{
    "question": "${QUESTION_TEXT}",
    "header": "${CATEGORY}",
    "options": [
      { "label": "Provide answer", "description": "I'll type the context" },
      { "label": "Skip", "description": "Not applicable or unknown" }
    ],
    "multiSelect": false
  }]
}
```

If user chooses "Provide answer", prompt for free-text response.

### Step 6: Generate Enhanced Sections

For each answered question, generate a CLAUDE.md section:

**Section format:**
```markdown
## ${SECTION_TITLE}
<!-- Added by context-auditor on ${DATE} -->

${CONTENT_FROM_USER_ANSWER}

**Related code:** ${FILE_PATHS_FROM_AGENT_CONTEXT}
```

**Section mapping** (use agent's suggested structure):
- Business Context questions → "## Business Domain" or "## Problem & Users"
- Architectural questions → "## Architecture & Key Decisions"
- Integration questions → "## External Integrations"
- Domain Logic questions → "## Domain Model" or "## Core Workflows"
- Known Issues questions → "## Known Limitations" or "## Technical Debt"
- Conventions questions → "## Development Workflow" or "## Team Practices"
- Environment questions → "## Setup & Troubleshooting"

### Step 7: Merge into CLAUDE.md

**If CLAUDE.md exists:**
- Use Edit tool to insert new sections at appropriate locations
- Follow the agent's suggested structure for placement
- Preserve all existing content
- Add sections after existing similar sections or at end

**If creating new CLAUDE.md:**
- Use Write tool to create complete file with:
  - Project header (name from package.json/pyproject.toml)
  - Overview section (generated from answered questions)
  - New sections from user answers
  - Quick commands section (if manifest has scripts)

### Step 8: Confirm with User

Present summary of changes:

```markdown
## Context Audit Complete ✓

**Updated:** ${CLAUDE_MD_PATH}

**Sections added/enhanced:**
- ${SECTION_1} (from question ${Q_NUM})
- ${SECTION_2} (from question ${Q_NUM})
- ${SECTION_3} (from question ${Q_NUM})

**Questions answered:** ${ANSWERED_COUNT} of ${TOTAL_COUNT}
**Questions skipped:** ${SKIPPED_COUNT}

The enhanced CLAUDE.md now includes human context on:
- ${CATEGORY_1}
- ${CATEGORY_2}
- ${CATEGORY_3}

Run `/ce:audit-context` again anytime to identify new gaps.
```

## Error Handling

**If CLAUDE.md path is invalid:**
- Show error: "CLAUDE.md not found at ${PATH}"
- Ask user to provide correct path or create new file

**If agent analysis fails:**
- Show error: "Failed to analyze codebase"
- Check if project root is correct
- Verify codebase has analyzable files

**If user skips all questions:**
- Ask: "All questions were skipped. Would you like to see the agent's full gap analysis instead?"
- If yes, display the complete agent output
- If no, exit without changes

**If Edit/Write fails:**
- Show error with file path and permission issue
- Ask user to check file permissions
- Offer to output generated sections to stdout instead

## Notes

- Agent executes once and returns structured analysis
- Command handles all user interaction (agent cannot ask questions)
- Questions are limited to 5-7 to respect user time
- Users can skip any question - partial information is valuable
- Generated content is marked with HTML comments for tracking
- Agent adapts question relevance to project type (CLI vs web app vs library)
