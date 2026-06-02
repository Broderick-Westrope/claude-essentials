---
description: Multi-model code review — runs Sonnet, Opus, and Convention reviewers in parallel, deduplicates findings
argument-hint: "[instructions]"
---

Run three code reviewers in parallel (Sonnet for speed/breadth, Opus for depth/nuance, Convention for convention compliance), then deduplicate and merge their findings into a single unified review.

## Step 1: Determine Review Scope

**If `$ARGUMENTS` is provided:**

- Use the instructions from the user as the review scope.

**If `$ARGUMENTS` is empty:**

1. Check git status to see if there are uncommitted changes
2. Check current branch name
3. Determine what to review:
   - If uncommitted changes exist: Review uncommitted changes
   - If no uncommitted changes exist:
     - Check if on a feature branch (not main/master/develop)
     - Suggest reviewing all changes in current branch against main (or upstream branch)
     - Check the changed files via `git diff --name-only $([ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] && echo "HEAD^" || echo "main...HEAD")`
     - Ask user what should be reviewed

## Step 2: Launch Multi-Model Review

Launch ALL THREE agents **in parallel**, passing the same review scope to each:

1. **ce-code-reviewer-sonnet** (Sonnet) — fast, broad coverage
2. **ce-code-reviewer-opus** (Opus) — deep, nuanced analysis
3. **ce-convention-reviewer** (Opus) — convention compliance

All agents receive identical instructions about what to review. Wait for all to complete.

### Failure handling

If one reviewer fails, errors, or times out:
- Proceed with the two surviving reviewers' output
- Note in the Summary: "Note: [name] reviewer failed — two-reviewer result"
- Findings attributed to surviving reviewers only
- Verdict is based on surviving reviews

If two reviewers fail:
- Proceed with the single surviving reviewer's output
- Note in the Summary: "Note: [name] and [name] reviewers failed — single-reviewer result"
- Verdict is based on the single review

## Step 3: Deduplicate and Merge

Parse both reviews and produce a single unified output. Use this process:

### Matching findings

Two findings match when they reference the **same file and line** (or overlapping line range) AND describe the **same underlying issue**. Minor wording differences don't matter — match on substance.

### Merging rules

| Scenario | Action |
|----------|--------|
| Multiple reviewers found the same issue | Single entry, mark with combined attribution (e.g. `[Sonnet + Opus]`, `[Opus + Convention]`, `[Sonnet + Opus + Convention]`) — higher confidence |
| Only one reviewer found it | Single entry, mark with `[Sonnet]`, `[Opus]`, or `[Convention]` |
| Reviewers disagree on severity | Use the higher severity, note the disagreement |
| Reviewers contradict each other | Include both perspectives inline, let user decide |

### Verdict logic

Any reviewer requesting changes → merged verdict is **REQUEST CHANGES**.
Only unanimous APPROVE across all surviving reviewers → **APPROVE**.

## Step 4: Present Unified Review

Output the merged review using this format:

```markdown
# Code Review (Multi-Model)

## Summary

- **Files changed**: X files (+Y/-Z lines)
- **Change type**: [Feature | Bug Fix | Refactor | Enhancement]
- **Scope**: [Brief 1-2 sentence description]
- **Reviewers**: Sonnet + Opus + Convention (parallel)
- **Agreement**: X of Y findings confirmed by multiple reviewers

## Critical Issues ⛔

- `[Sonnet + Opus]` `file.ts:123` - [Issue description]
- `[Opus]` `file.ts:456` - [Issue only Opus caught]

## Important Issues ⚠️

- `[Sonnet + Opus]` `file.ts:789` - [Issue description]
- `[Convention]` `file.ts:012` - [Convention violation only Convention caught]

## Product & UX Issues 🎯

- [Same attribution pattern]

## Developer Experience Issues 🔧

- [Same attribution pattern]

## Documentation Updates Needed 📝

- [Same attribution pattern]

## Suggestions 💡

- [Same attribution pattern]

## Verdict

**[APPROVE | REQUEST CHANGES]** - [Explanation including any reviewer disagreement]

## Blocking Summary

**Must fix:**
1. [Critical and Important issue references with one-line descriptions]

**Suggestions:**
1. [Lower-priority improvements]
```

## Step 5: Post-Review Workflow

After presenting the unified review:

1. **If APPROVE:** Report the review summary. Done.

2. **If REQUEST CHANGES:**

   a. Extract all Critical and Important issues into a checklist:
   ```
   Review Findings - [branch/scope]:
   - [ ] [CRITICAL] [Sonnet + Opus] file.ts:123 - Description
   - [ ] [IMPORTANT] [Opus] file.ts:456 - Description
   - [ ] [IMPORTANT] [Convention] file.ts:789 - Description
   ```

   b. Ask the user how to proceed:
   - "Fix all issues now" (recommended - fix everything the reviewer found)
   - "Show the full review, I'll handle it"

   c. **Determine commit mode** before fixing:
      - Check whether the reviewed changes were already committed (i.e. the review was of committed code, not uncommitted/staged changes).
      - If yes → **commit mode ON**: each fix will be committed individually.
      - If no (reviewing uncommitted changes) → **commit mode OFF**: fixes are applied but not committed (the user manages their own commits).

   d. If fixing: work through the checklist sequentially. For each issue:
      1. Implement the fix
      2. **If commit mode is ON:** commit the fix as a separate commit with a descriptive message explaining the issue and how it was resolved (e.g. `fix: resolve potential null dereference in user lookup\n\nThe getUserById call could return null when the user was deleted\nbetween the auth check and the lookup. Added an explicit null check\nwith early return.`)
      3. Mark the checklist item complete

   After all targeted items are fixed, re-run the multi-model review to verify the fixes don't introduce new issues.
