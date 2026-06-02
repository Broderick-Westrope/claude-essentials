# Convention Reviewer Implementation Plan

> **Status:** DRAFT

## Specification

**Problem:** The existing dual-model review command treats convention compliance as one bullet among many. Conventions get diluted alongside security, performance, architecture, UX, DX, and documentation concerns. Subtle convention violations slip through because no reviewer is focused on compliance.

**Goal:** A third parallel reviewer agent dedicated to convention compliance, running on all three platforms (Claude Code, OpenCode, Anvil). Convention findings merge into the existing output format with `[Convention]` attribution. The review command rebrands from "Dual-model" to "Multi-model."

**Scope:** New `convention-reviewer` agent across 3 platforms, updated review commands across 3 platforms, updated merge/verdict/failure logic, regenerated OpenCode manifest, updated ANVIL.md docs.

**Success Criteria:**

- [ ] `convention-reviewer` agent exists for Claude Code, OpenCode, and Anvil
- [ ] Review commands on all platforms launch three reviewers in parallel
- [ ] Convention findings use `[Convention]` attribution and merge with existing findings
- [ ] 3-way attribution works: `[Convention]`, `[Sonnet + Convention]`, `[Opus + Convention]`, `[Sonnet + Opus + Convention]`
- [ ] Verdict: any REQUEST CHANGES → merged REQUEST CHANGES
- [ ] Failure handling covers all 3-reviewer permutations
- [ ] Agent dynamically loads relevant skills at runtime
- [ ] OpenCode `manifest.json` regenerated
- [ ] `ANVIL.md` agent dependency map and per-agent table updated

## Context Loading

_Run before starting:_

```bash
read plugins/ce/agents/code-reviewer-opus.md
read plugins/ce/agents/code-reviewer-sonnet.md
read opencode/agents/ce-code-reviewer-opus.md
read opencode/agents/ce-code-reviewer-sonnet.md
read anvil/agents/reviewer.md
read plugins/ce/commands/review.md
read opencode/commands/ce-review.md
read anvil/commands/review.md
read ANVIL.md
read plans/design-2026-06-02-convention-reviewer.md
```

## Tasks

### Convention Reviewer Agent

#### Task 1: Create Claude Code convention-reviewer agent

**Context:** `plugins/ce/agents/code-reviewer-opus.md` (frontmatter pattern + output format reference), `plans/design-2026-06-02-convention-reviewer.md` (spec)

**Files:**
- Create: `plugins/ce/agents/convention-reviewer.md`

**Steps:**

1. [ ] Read `plugins/ce/agents/code-reviewer-opus.md` to understand the Claude Code agent frontmatter format and output format
2. [ ] Create `plugins/ce/agents/convention-reviewer.md` with:

**Frontmatter:**
```yaml
name: convention-reviewer
description: Convention compliance reviewer for code changes. Used by the /ce:review command as part of multi-model review.
tools: Bash, Glob, Grep, Read
model: opus
color: purple
```

Notes on tool choices vs existing reviewers:
- `TodoWrite` excluded — the convention reviewer doesn't manage checklists; the review *command* handles that
- `mcp__ide__getDiagnostics` excluded — static analysis is the general reviewers' job, not the convention reviewer's
- No `skills` field in frontmatter — Claude Code agents without a `skills` field can load skills dynamically at runtime via their system prompt

**System prompt body — write the full prompt with these sections:**

**Section 1: Role introduction**
```
You are a convention compliance reviewer. Your job is to ensure code changes follow the project's established conventions — documented rules, loaded skill conventions, and inferred codebase patterns. Convention compliance is your primary mission. You are NOT a general code reviewer — that's handled by dedicated Sonnet and Opus reviewers running in parallel with you.
```

**Section 2: Review Workflow** (numbered steps)

Step 1 — **Analyze Complete Diff**: Same as existing reviewers. Check git status, current branch, identify base branch. Get complete diff via `git diff <base>...HEAD`. Review commit messages for context.

Step 2 — **Discover Convention Sources**: Deep read of all convention documentation. Search for and read:
- `CLAUDE.md`, `.claude/rules/*`, `AGENTS.md`, `ANVIL.md`
- `CONTRIBUTING.md`, `README.md` (conventions sections)
- Linter/formatter configs: `.eslintrc*`, `tsconfig.json`, `pyproject.toml`, `.prettierrc*`, `.editorconfig`, `biome.json`, `.golangci.yml`, `rustfmt.toml`, etc.
- Any `docs/` directory files related to coding standards or conventions

Record what convention sources were found and what rules they establish. If no explicit docs exist, note this — the agent will rely on inferred patterns (Step 4).

Step 3 — **Discover and Load Relevant Skills**: Check available skills for any relevant to the project's language, framework, or tooling. Load matching skills as additional convention references. Examples: a Go project would load `euc-go`; a TypeScript project would load `euc-ts`; a project using GraphQL would load `euc-graphql`. These are user/org-level skills that may or may not be available at runtime — gracefully handle their absence. Also load general convention skills if available: `handling-errors`, `writing-tests`, `documenting-code-comments`.

Step 4 — **Infer Codebase Conventions**: This is the expected common case — most projects lack explicit convention docs. Sample existing code (not just the diff) to identify established patterns:
- Naming conventions (casing, prefixes, suffixes)
- Error handling patterns (throw vs return, error types)
- Test patterns (file naming, assertion style, test structure)
- File/directory organization conventions
- Import ordering and grouping
- Comment style and documentation patterns
- Code structure patterns (early returns, guard clauses, etc.)

Focus on patterns with strong consistency (>80% adherence) — inconsistent patterns aren't conventions.

Step 5 — **Review Diff Against Conventions**: For each changed file, evaluate every change against the convention hierarchy: documented rules > skill conventions > inferred codebase patterns. Each finding must reference a specific `file:line` in the diff. For each violation, cite which convention source it violates (e.g., "CLAUDE.md requires named exports" or "Inferred: existing codebase uses camelCase for function names").

Step 6 — **Flag Doc-vs-Codebase Drift**: When documented conventions contradict inferred codebase patterns, surface as a separate finding. The documented convention is authoritative — the finding should note the drift and reference a representative example in the diff. Example: "CLAUDE.md says 'use named exports' but 12 of 15 existing files use default exports. The diff at `src/foo.ts:3` uses a default export, which matches the codebase but violates the documented convention."

Step 7 — **Opportunistic Critical Flags**: If you spot a critical bug or security vulnerability while reviewing for conventions, flag it. Do not perform a comprehensive general review — that's the other reviewers' job. Only flag issues that are obviously critical and would be irresponsible to ignore.

**Section 3: Output Format** — Use the exact same output format as the existing reviewers:

```markdown
# Code Review

## Summary

- **Files changed**: X files (+Y/-Z lines)
- **Change type**: [Feature | Bug Fix | Refactor | Enhancement]
- **Scope**: [Brief 1-2 sentence description]
- **Convention sources**: [List what was found: CLAUDE.md, .eslintrc, inferred patterns, loaded skills]

## Critical Issues ⛔
## Important Issues ⚠️
## Product & UX Issues 🎯
## Developer Experience Issues 🔧
## Documentation Updates Needed 📝
## Suggestions 💡

## Verdict

**[APPROVE | REQUEST CHANGES]** - [One sentence explanation]

## Blocking Summary

**Must fix:**
1. [...]

**Suggestions:**
1. [...]
```

All findings must include `file:line` references. Convention findings should cite their source (e.g., "`src/auth.ts:42` — uses `any` type; violates tsconfig.json `strict: true` and inferred pattern of explicit typing throughout `src/auth/`").

**Section 4: Review Principles**

- Convention compliance is the mission. Resist the urge to do a general code review.
- Documented conventions are authoritative. When docs contradict the codebase, the docs win.
- Inferred conventions are fallback. When docs are silent, the codebase IS the convention — but only for patterns with strong consistency.
- Cite your sources. Every finding should say which convention it violates and where that convention is defined.
- Reference diff locations only. All findings must point to `file:line` in the changed code, not in convention documents.
- Don't duplicate the general reviewers' work. They cover correctness, security, performance, architecture, UX, DX, and documentation comprehensively. You cover convention compliance.

**Verify:**
```bash
head -10 plugins/ce/agents/convention-reviewer.md
# Verify key sections exist
grep -c "^##" plugins/ce/agents/convention-reviewer.md
# Verify it doesn't reference "dual-model"
grep -i "dual" plugins/ce/agents/convention-reviewer.md
```

#### Task 2: Create OpenCode convention-reviewer agent

**Context:** `opencode/agents/ce-code-reviewer-opus.md` (frontmatter pattern), Task 1 output (system prompt body)

**Files:**
- Create: `opencode/agents/ce-convention-reviewer.md`

**Steps:**

1. [ ] Read `opencode/agents/ce-code-reviewer-opus.md` to understand the OpenCode agent frontmatter format
2. [ ] Create `opencode/agents/ce-convention-reviewer.md` with:

**Frontmatter** (OpenCode format — note: no `tools` or `skills` fields, uses `mode: subagent`, full model string, hex color):
```yaml
name: ce-convention-reviewer
description: Convention compliance reviewer for code changes. Used by the /ce-review command as part of multi-model review.
mode: subagent
model: anthropic/claude-opus-4-6
color: "#9b59b6"
```

**System prompt body:** Identical to the Claude Code version from Task 1. Copy the full body after the frontmatter `---` delimiter.

**Verify:**
```bash
head -10 opencode/agents/ce-convention-reviewer.md
# Verify body matches Claude Code version (ignore frontmatter)
tail -n +8 plugins/ce/agents/convention-reviewer.md > /tmp/cc-body.md
tail -n +8 opencode/agents/ce-convention-reviewer.md > /tmp/oc-body.md
diff /tmp/cc-body.md /tmp/oc-body.md
# Expected: no differences
```

#### Task 3: Create Anvil convention-reviewer agent

**Context:** `anvil/agents/reviewer.md` (frontmatter pattern), `ANVIL.md` (format spec, nil-vs-empty semantics), Task 1 output (system prompt body)

**Files:**
- Create: `anvil/agents/convention-reviewer.md`

**Steps:**

1. [ ] Read `anvil/agents/reviewer.md` to understand the Anvil agent frontmatter format
2. [ ] Create `anvil/agents/convention-reviewer.md` with:

**Frontmatter** (Anvil format — note nil-vs-empty semantics are critical):
```yaml
role: Convention compliance reviewer for code changes
delegate_when: >
  Convention-focused code review, checking changes against project standards,
  CLAUDE.md rules, skill conventions, and inferred codebase patterns.
dont_delegate_when: >
  General code review (use reviewer), architectural decisions (use oracle),
  spec review (use devils-advocate).
delegates_to: []
tools:
  - glob
  - grep
  - ls
  - view
  - lsp_diagnostics
  - lsp_references
  - sourcegraph
  - bash
mcps: {}
routing_hint: "Route convention compliance review to @convention-reviewer."
```

**CRITICAL: Do NOT include a `skills` field.** Per ANVIL.md nil-vs-empty semantics:
- `skills: []` = none allowed (empty allow-list) — **this would block dynamic skill loading**
- Field omitted = nil = unrestricted (all skills available) — **this is what we want**

The agent's system prompt handles skill discovery and loading at runtime. The Anvil capability config must allow it.

**System prompt body:** Identical to the Claude Code version from Task 1.

**Verify:**
```bash
head -25 anvil/agents/convention-reviewer.md
# Verify required Anvil routing fields
grep -E "^(role|delegate_when|dont_delegate_when|delegates_to):" anvil/agents/convention-reviewer.md
# Verify skills field is NOT present (nil = unrestricted)
grep "^skills:" anvil/agents/convention-reviewer.md && echo "ERROR: skills field should be omitted" || echo "OK: skills field omitted"
```

### Review Command Updates

#### Task 4: Update Claude Code review command

**Context:** `plugins/ce/commands/review.md` (current command), `plans/design-2026-06-02-convention-reviewer.md` (spec)

**Files:**
- Modify: `plugins/ce/commands/review.md`

**Steps:**

1. [ ] Read `plugins/ce/commands/review.md` fully
2. [ ] Update description frontmatter: `"Multi-model code review — runs Sonnet, Opus, and Convention reviewers in parallel, deduplicates findings"`
3. [ ] Update opening paragraph: "Run three code reviewers in parallel (Sonnet for speed/breadth, Opus for depth/nuance, Convention for convention compliance), then deduplicate and merge their findings into a single unified review."
4. [ ] Update Step 2:
   - Heading: "Launch Multi-Model Review"
   - Add third reviewer: `3. **convention-reviewer** (Opus) — convention compliance`
   - Update text: "Launch ALL THREE agents **in parallel**..."
   - Update: "All agents receive identical instructions about what to review. Wait for all to complete."
5. [ ] Update failure handling to cover 3-reviewer permutations:
   ```
   If one reviewer fails, errors, or times out:
   - Proceed with the two surviving reviewers' output
   - Note in the Summary: "Note: [name] reviewer failed — two-model review"
   - Findings attributed to surviving reviewers only
   - Verdict is based on surviving reviews

   If two reviewers fail:
   - Proceed with the single surviving reviewer's output
   - Note in the Summary: "Note: [name] and [name] reviewers failed — single-model review"
   - Verdict is based on the single review
   ```
6. [ ] Update Step 3 merging rules table — add rows:
   ```
   | Multiple reviewers found the same issue | Single entry, mark with combined attribution (e.g. `[Sonnet + Opus]`, `[Opus + Convention]`, `[Sonnet + Opus + Convention]`) — higher confidence |
   | Only one reviewer found it | Single entry, mark with `[Sonnet]`, `[Opus]`, or `[Convention]` |
   ```
7. [ ] Replace the 2x2 verdict matrix with a simple rule:
   ```
   ### Verdict logic

   Any reviewer requesting changes → merged verdict is **REQUEST CHANGES**.
   Only unanimous APPROVE across all surviving reviewers → **APPROVE**.
   ```
8. [ ] Update Step 4 output format:
   - Heading: `# Code Review (Multi-Model)`
   - Reviewers line: `Sonnet + Opus + Convention (parallel)`
   - Agreement line: `X of Y findings confirmed by multiple reviewers`
   - Update examples to show `[Convention]` and combined attributions
9. [ ] Update Step 5 post-review checklist examples to include `[Convention]` attribution
10. [ ] Change final re-run line from "re-run the dual-model review" to "re-run the multi-model review"

**Verify:**
```bash
# No references to "dual" should remain
grep -i "dual" plugins/ce/commands/review.md && echo "FAIL: dual references remain" || echo "OK"
# Should find convention-reviewer
grep "convention-reviewer" plugins/ce/commands/review.md
# Check three reviewers in Step 2
grep -A8 "Launch Multi-Model" plugins/ce/commands/review.md
```

#### Task 5: Update OpenCode review command

**Context:** `opencode/commands/ce-review.md` (current command), Task 4 output (reference for changes)

**Files:**
- Modify: `opencode/commands/ce-review.md`

**Steps:**

1. [ ] Read `opencode/commands/ce-review.md` fully
2. [ ] Apply the same changes as Task 4, with OpenCode-specific adjustments:
   - Agent names use `ce-` prefix: `ce-code-reviewer-sonnet`, `ce-code-reviewer-opus`, `ce-convention-reviewer`
   - Frontmatter uses `argument-hint` (same as Claude Code)
3. [ ] Verify all "dual" references are replaced

**Verify:**
```bash
grep -i "dual" opencode/commands/ce-review.md && echo "FAIL" || echo "OK"
grep "ce-convention-reviewer" opencode/commands/ce-review.md
```

#### Task 6: Update Anvil review command

**Context:** `anvil/commands/review.md` (current command), Task 4 output (reference for changes)

**Files:**
- Modify: `anvil/commands/review.md`

**Steps:**

1. [ ] Read `anvil/commands/review.md` fully
2. [ ] Apply the same changes as Task 4, with Anvil-specific adjustments:
   - Frontmatter uses `argument_hint` (underscore, not hyphen)
   - Agent names: the existing command references `ce-code-reviewer-sonnet` and `ce-code-reviewer-opus` (pre-existing naming issue — these aren't actual Anvil agent names). Add the convention reviewer using the same pattern for consistency: `ce-convention-reviewer`
   - Do NOT fix the pre-existing agent naming issue — that's out of scope
3. [ ] Verify all "dual" references are replaced

**Verify:**
```bash
grep -i "dual" anvil/commands/review.md && echo "FAIL" || echo "OK"
grep "convention-reviewer" anvil/commands/review.md
```

### Cleanup and Docs

#### Task 7: Update agent descriptions referencing "dual-model"

**Context:** Existing reviewer agents reference "dual-model review" in their descriptions

**Files:**
- Modify: `plugins/ce/agents/code-reviewer-opus.md` (line 3: description)
- Modify: `plugins/ce/agents/code-reviewer-sonnet.md` (line 3: description)
- Modify: `opencode/agents/ce-code-reviewer-opus.md` (line 3: description)
- Modify: `opencode/agents/ce-code-reviewer-sonnet.md` (line 3: description)

**Steps:**

1. [ ] In each file, change "dual-model review" to "multi-model review" in the `description` field
   - Claude Code Opus: `description: Opus-powered code reviewer for deep, nuanced PR analysis. Used by the /ce:review command as part of multi-model review.`
   - Claude Code Sonnet: `description: Sonnet-powered code reviewer for fast, broad PR analysis. Used by the /ce:review command as part of multi-model review.`
   - OpenCode Opus: `description: Opus-powered code reviewer for deep, nuanced PR analysis. Used by the /ce-review command as part of multi-model review.`
   - OpenCode Sonnet: `description: Sonnet-powered code reviewer for fast, broad PR analysis. Used by the /ce-review command as part of multi-model review.`

**Verify:**
```bash
grep -i "dual" plugins/ce/agents/code-reviewer-*.md opencode/agents/ce-code-reviewer-*.md && echo "FAIL" || echo "OK"
```

#### Task 8: Update ANVIL.md and regenerate OpenCode manifest

**Context:** `ANVIL.md` (agent docs), `scripts/build-manifest.js` (manifest generator)

**Files:**
- Modify: `ANVIL.md` (agent dependency map and per-agent table)
- Regenerate: `opencode/plugins/manifest.json`

**Steps:**

1. [ ] Read the agent dependency map section in `ANVIL.md` (lines 217-251)
2. [ ] Add `convention-reviewer` as a leaf node in the dependency tree, after `reviewer`:
   ```
   ├── reviewer             (leaf)
   ├── convention-reviewer  (leaf — no sub-delegation)
   └── devils-advocate      (leaf)
   ```
3. [ ] Add a row to the per-agent summary table after the `reviewer` row:
   ```
   | convention-reviewer | — | explorer tools + bash | Unrestricted (dynamic) | None |
   ```
   Note: "explorer tools + bash" matches the Anvil agent's actual tool list. "Unrestricted (dynamic)" reflects that the `skills` field is omitted (nil) and the agent loads skills at runtime. The existing `reviewer` row says "explorer tools" but its actual frontmatter includes `bash` — this is a pre-existing doc discrepancy; don't fix it here.
4. [ ] Run `node scripts/build-manifest.js` to regenerate `opencode/plugins/manifest.json`
5. [ ] Verify the generated manifest includes `ce-convention-reviewer`

**Verify:**
```bash
grep "convention-reviewer" ANVIL.md
node scripts/build-manifest.js
grep "convention-reviewer" opencode/plugins/manifest.json
```

<!-- Review notes: Plan reviewed by devils-advocate (2 rounds). Key fixes from review: (1) Anvil `skills` field omitted entirely (not `[]`) to enable dynamic skill loading per nil-vs-empty semantics. (2) Claude Code tool list explicitly justified — excludes TodoWrite and mcp__ide__getDiagnostics since convention reviewer doesn't manage checklists or run static analysis. (3) Added Task 7 to update existing agent descriptions that reference "dual-model". (4) System prompt fully specified in Task 1 with all sections, examples, and principles rather than leaving it as bullets for the executor. (5) ANVIL.md table entry uses "Unrestricted (dynamic)" for skills column to reflect runtime loading. (6) Verify steps made concrete with expected outputs and failure messages. -->
