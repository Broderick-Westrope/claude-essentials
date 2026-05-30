---
name: writing-plans
description: Create implementation plans with tasks grouped by subsystem. Related tasks share agent context; groups parallelize across subsystems.
---

# Writing Plans

Write step-by-step implementation plans for agentic execution. Each task should be a **complete unit of work** that one agent handles entirely.

## When Invoked With a Spec File

When a spec file path is provided (from the grilling skill or by the user), read the file and use it directly as the plan's Specification section:

- Read the spec file and extract "Problem", "Goal", "Scope", "Constraints", "Success Criteria"
- Map these directly into the plan template
- Use "Design Decisions" to inform task structure and approach
- Use "Context Files" to populate the Context Loading section
- Skip the "Clarify ambiguity upfront" step for fields the spec covers
- Still ask about anything the spec leaves genuinely ambiguous (e.g., missing success criteria, unclear scope boundaries)

**Clarify ambiguity upfront:** If the plan has unclear requirements or meaningful tradeoffs, ask the user before writing the plan. Present options with descriptions explaining the tradeoffs. Use `multiSelect: true` for independent features that can be combined; use single-select for mutually exclusive choices. Don't guess when the user can clarify in 10 seconds. If a spec file is provided, only clarify what the spec leaves ambiguous. Do not re-derive information already present in the spec.

**Save to:** `**/plans/impl-YYYY-MM-DD-<feature-name>.md`

## Plan Template

````markdown
# [Feature Name] Implementation Plan

> **Status:** DRAFT | APPROVED | IN_PROGRESS | COMPLETED

## Specification

**Problem:** [What's broken, missing, or needed. Describe the current state and why it's insufficient. Be specific enough that someone unfamiliar with the codebase understands the issue.]

**Goal:** [What the end state looks like after this work is done. Describe the user/developer experience, not the implementation.]

**Scope:** [What's in and what's out. Explicit boundaries prevent scope creep.]

**Success Criteria:**

- [ ] Criterion 1 (measurable/verifiable)
- [ ] Criterion 2

<!-- When a spec file is provided, populate these fields from it rather than asking the user to re-state them. -->

## Context Loading

_Run before starting:_

```bash
read src/relevant/file.ts
glob src/feature/**/*.ts
```

## Tasks

### Task 1: [Complete Feature Unit]

**Context:** `src/auth/`, `tests/auth/`

**Files:**
- Create: `src/auth/login.ts`
- Modify: `src/auth/index.ts` (add export)
- Test: `tests/auth/login.test.ts`

**Steps:**

1. [ ] Create `src/auth/login.ts` with `authenticate(email, password)` function that validates credentials against the user store and returns a JWT
2. [ ] Add integration test in `tests/auth/login.test.ts` covering: valid login, invalid password, missing user
3. [ ] Export `authenticate` from `src/auth/index.ts`

**Verify:**
```bash
npm test -- tests/auth/
# Expected: 3 tests passing, 0 failures
```
````

## Scope Check

If the spec covers multiple independent subsystems with no shared dependencies, consider breaking into separate plans. A plan that touches auth, billing, AND notifications is probably three plans. One plan = one cohesive feature.

## Task Sizing

A task includes **everything** to complete one logical unit:

- Implementation + tests + types + exports
- All steps a single agent should do together

**Right-sized:** "Add user authentication" - one agent does model, service, tests, types
**Wrong:** Separate tasks for model, service, tests - these should be one task

**Bundle trivial items:** Group small related changes (add export, update config, rename) into one task.

## Parallelization & Grouping

During execution, tasks are **grouped by subsystem** to share agent context. Structure your plan to make grouping clear:

```markdown
## Authentication Tasks ← These will run in one agent

### Task 1: Add login

### Task 2: Add logout

## Billing Tasks ← These will run in another agent (parallel)

### Task 3: Add billing API

### Task 4: Add webhooks

## Integration Tasks ← Sequential (depends on above)

### Task 5: Wire auth + billing
```

**Execution model:**

- Tasks under same `##` heading → grouped into one agent
- Groups touching different subsystems → run in parallel
- Max 3-4 tasks per group (split larger sections)

Tasks in the **same subsystem** should be sequential or combined into one task.

## Rules

1. **Explicit paths:** Say "create `src/utils/helpers.ts`" not "create a utility"
2. **Context per task:** List files the agent should read first
3. **Verify every task:** End with a command that proves it works
4. **One agent per task:** All steps in a task are handled by the same agent
5. **Self-contained tasks:** Each task must be completable by an agent with zero prior context. Include complete code snippets (not "add validation"), exact commands with expected output, and all file paths.
6. **Scope check:** If the spec spans multiple independent subsystems, split into separate plans.

## Before Presenting

Before presenting the plan to the user, dispatch the **devils-advocate** agent as a subagent to review it:

- Pass the full drafted plan text to the agent
- Load relevant domain skills based on what the plan involves. Evaluate which of these apply and include them in the agent prompt:
  - **architecting-systems** - system design, module boundaries, dependencies
  - **managing-databases** - database schemas, queries, migrations
  - **handling-errors** - error handling patterns
  - **writing-tests** - test strategy and quality
  - **migrating-code** - code migrations, API versioning
  - **optimizing-performance** - performance-sensitive work
  - **refactoring-code** - structural refactoring
- The agent will look for: unstated assumptions, missing edge cases, tasks that are too vague, missing dependencies between tasks, verification gaps
- When a spec file is provided, also evaluate whether the spec's design decisions are architecturally sound and whether the plan faithfully implements the spec's stated goals
- Incorporate valid feedback into the plan
- Note what the review caught in a brief "Review notes" comment at the bottom of the plan

Skip this step only if the plan is trivial (< 3 tasks, single subsystem, no architectural decisions).

## Large Plans

For plans over ~500 lines, split into phases in a folder:

```
**/plans/impl-YYYY-MM-DD-feature/
├── README.md           # Overview + phase tracking
├── phase-1-setup.md
└── phase-2-feature.md
```
