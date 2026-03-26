---
name: executing-plans
description: Executes implementation plans with smart task grouping. Groups related tasks to share context, parallelizes across independent subsystems.
---

# Executing Plans

**You are an orchestrator.** Spawn and coordinate sub-agents to do the actual implementation. Group related tasks by subsystem (e.g., one agent for API routes, another for tests) rather than spawning per-task. Each agent re-investigates the codebase, so fewer agents with broader scope = faster execution.

## 1. Setup

**Create a branch** for the work unless trivial. Consider git worktrees for isolated environments. For worktree setup, see **using-git-worktrees**.

**Clarify ambiguity upfront:** If the plan has unclear requirements or meaningful tradeoffs, ask the user before starting. Present options with descriptions explaining the tradeoffs. Use `multiSelect: true` for independent features that can be combined; use single-select for mutually exclusive choices. Don't guess when the user can clarify in 10 seconds.

**Track progress with tasks:** Create tasks for each major work item from the plan. Update task status as work progresses (`in_progress` when starting, `completed` when done). This makes execution visible to the user and persists across context compactions.

## 2. Group Tasks by Subsystem

Group related tasks to share agent context. One agent per subsystem, groups run in parallel.

**Why grouping matters:**
```
Without: Task 1 (auth/login) → Agent 1 [explores auth/]
         Task 2 (auth/logout) → Agent 2 [explores auth/ again]

With:    Tasks 1-2 (auth/*) → Agent 1 [explores once, executes both]
```

| Signal | Group together |
|--------|----------------|
| Same directory prefix | `src/auth/*` tasks |
| Same domain/feature | Auth tasks, billing tasks |
| Plan sections | Tasks under same `##` heading |

**Limits:** 3-4 tasks max per group. Split if larger.

**Parallel:** Groups touch different subsystems
```
Group A: src/auth/*    ─┬─ parallel
Group B: src/billing/* ─┘
```

**Sequential:** Groups have dependencies
```
Group A: Create shared types → Group B: Use those types
```

## 3. Execute

Dispatch sub-agents to complete task groups. Monitor progress and handle issues.

```
Subagent (general-purpose):
  description: "Auth tasks: login, logout"
  prompt: |
    Execute these tasks from [plan-file] IN ORDER:
    - Task 1: Add login endpoint
    - Task 2: Add logout endpoint

    Use skills: <relevant skills>
    Commit after each task. Report: files changed, test results
```

**Architectural fit:** Changes should integrate cleanly with existing patterns. If a change feels like it's fighting the architecture, that's a signal to refactor first rather than bolt something on. Don't reinvent wheels when battle-tested libraries exist, but don't reach for a dependency for trivial things either (no lodash just for `_.map`). The goal is zero tech debt, not "ship now, fix later."

**Auto-recovery:**
1. Agent attempts to fix failures (has context)
2. If can't fix, report failure with error output
3. Dispatch fix agent with context
4. Same error twice → stop and ask user

### Implementer Status Handling

When a sub-agent completes, interpret its report:

| Status | Action |
|--------|--------|
| **DONE** | Proceed to verification |
| **DONE_WITH_CONCERNS** | Read the concerns before proceeding — they may affect other tasks |
| **NEEDS_CONTEXT** | Provide the missing context and re-dispatch |
| **BLOCKED** | Assess: is it a context problem (provide more files), task too large (split it), or plan wrong (escalate to user)? |

## 4. Verify

All five checks must pass before marking complete:

1. **Spec compliance:** Does the implementation match the plan's requirements? Check for: unrequested features added, specified behavior missing, deviations from the plan's file paths or API contracts. This is a quick sanity check, not a full code review.

2. **Automated tests:** Run the full test suite. All tests must pass.

3. **Manual verification:** Automated tests aren't sufficient. Actually exercise the changes:
   - **API changes:** Curl endpoints with realistic payloads
   - **External integrations:** Test against real services to catch rate limiting, format drift, bot detection
   - **CLI changes:** Run actual commands, verify output
   - **Parser changes:** Feed real data, not just fixtures

4. **DX quality:** During manual testing, watch for friction:
   - Confusing error messages
   - Noisy output (telemetry spam, verbose logging)
   - Inconsistent behavior across similar endpoints
   - Rough edges that technically work but feel bad

   Fix DX issues inline or document for follow-up. Don't ship friction.

5. **Code review (mandatory):** After tests pass and manual verification is done, dispatch the **code-reviewer** agent as a subagent to review the full diff against the base branch. This step is not optional.

   Load relevant domain skills into the agent based on what was implemented. Evaluate which apply and include them in the agent prompt:
   - **architecting-systems** - system design, module boundaries
   - **managing-databases** - database work
   - **handling-errors** - error handling
   - **writing-tests** - test quality
   - **migrating-code** - migrations
   - **optimizing-performance** - performance work
   - **refactoring-code** - refactoring

   Handle the review verdict:
   - **Must fix:** Fix all Critical and Important issues before marking complete
   - **Suggestions:** Fix these too unless there's a clear reason not to

   Plan execution is not done until review findings are addressed.

## 5. Commit

After verification passes, commit only the changes related to this plan:

1. Run `git status` to see all changes
2. **Stage files by name, not with `git add -A` or `git add .`** - only stage files you modified as part of this plan
3. **Leave unrelated changes alone** - if there are pre-existing staged or unstaged changes that aren't part of this work, don't touch them
4. Write a commit message that summarizes what was implemented, referencing the plan

## 6. Cleanup

After committing:
- Merge branch to main (if using branches)
- Remove worktree (if using worktrees)
- Mark plan file as COMPLETED
- Move to `./plans/done/` if applicable

For structured branch completion with merge/PR/cleanup options, see **finishing-a-development-branch**.
