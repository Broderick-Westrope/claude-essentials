---
description: Multi-model code review with Sonnet and Astra general and convention reviewers in parallel, deduplicates findings
argument_hint: "[instructions]"
---

Run four code reviews in parallel: general reviews on Sonnet and Astra, plus convention reviews on the convention agent's default model and Astra. Deduplicate and merge their findings into a single unified review.

## Model Configuration

Run both `reviewer` and `convention-reviewer` twice for different model perspectives.
The general reviews use explicit Sonnet and Astra overrides. The first convention
review uses the agent's configured model; the second explicitly uses Astra.

| Reviewer | Agent | Model Override |
|----------|-------|----------------|
| Sonnet | `reviewer` | `anthropic/claude-sonnet-5` |
| Astra | `reviewer` | `openai/gpt-6-astra` |
| Convention (default) | `convention-reviewer` | none (agent default) |
| Convention (Astra) | `convention-reviewer` | `openai/gpt-6-astra` |

Use exact `provider/model` IDs, not aliases like `astra`. An ID that does not
resolve is ignored and the agent's configured model is used instead, so a stale
pin degrades silently rather than erroring.

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

Launch ALL FOUR reviews **in parallel** using the `task` tool, passing the same review scope to each. Use the exact agent names and model overrides from the **Model Configuration** table above:

1. `task(subagent_type="reviewer", model="anthropic/claude-sonnet-5")`: **Sonnet**, general review
2. `task(subagent_type="reviewer", model="openai/gpt-6-astra")`: **Astra**, general review
3. `task(subagent_type="convention-reviewer")`: **Convention (default)**, convention compliance
4. `task(subagent_type="convention-reviewer", model="openai/gpt-6-astra")`: **Convention (Astra)**, convention compliance

All agents receive identical instructions about what to review. Wait for all to complete.

### Failure handling

If any reviewers fail, error, or time out:
- Proceed with the surviving reviewers' output.
- List the failed reviewers by their table labels and report how many of the four reviews completed in the Summary.
- Attribute findings only to surviving reviewers and base the verdict on those reviews.
- If all four fail, report that no review completed. Do not issue APPROVE or REQUEST CHANGES.

## Step 3: Deduplicate and Merge

Parse all four reviews (or all surviving reviews) and produce a single unified output. Use this process:

### Matching findings

Two findings match when they reference the **same file and line** (or overlapping line range) AND describe the **same underlying issue**. Minor wording differences don't matter — match on substance.

### Merging rules

| Scenario | Action |
|----------|--------|
| Multiple reviewers found the same issue | Single entry, mark with combined attribution (e.g. `[Sonnet + Astra]`, `[Convention (default) + Convention (Astra)]`, `[Astra + Convention (Astra)]`) — higher confidence |
| Only one reviewer found it | Single entry, mark with `[Sonnet]`, `[Astra]`, `[Convention (default)]`, or `[Convention (Astra)]` |
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
- **Reviewers**: Sonnet + Astra + Convention (default) + Convention (Astra) (parallel; list only completed reviews)
- **Agreement**: X of Y findings confirmed by multiple reviewers

## Critical Issues ⛔

- `[Sonnet + Astra]` `file.ts:123` - [Issue description]
- `[Astra]` `file.ts:456` - [Issue only Astra caught]

## Important Issues ⚠️

- `[Sonnet + Astra]` `file.ts:789` - [Issue description]
- `[Convention (default)]` `file.ts:012` - [Convention violation only the default convention reviewer caught]
- `[Convention (Astra)]` `file.ts:345` - [Convention violation only the Astra convention reviewer caught]

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
   - [ ] [CRITICAL] [Sonnet + Astra] file.ts:123 - Description
   - [ ] [IMPORTANT] [Astra] file.ts:456 - Description
   - [ ] [IMPORTANT] [Convention (default)] file.ts:789 - Description
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
