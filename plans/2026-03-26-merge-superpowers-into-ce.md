# Merge Superpowers Skills into CE — Implementation Plan

> **Status:** DRAFT

## Specification

**Problem:** Two Claude Code plugins (ce and superpowers) are installed concurrently, causing nondeterministic skill selection when both provide skills with overlapping descriptions (e.g., both have `systematic-debugging`, `verification-before-completion`, `writing-plans`, `executing-plans`, and a `code-reviewer` agent). This leads to inconsistent behavior across sessions.

**Goal:** A single ce plugin that incorporates the best ideas from both plugins. After completion, the superpowers plugin can be uninstalled with no loss of valuable workflow guidance. Agents see one skill per concept, eliminating nondeterminism.

**Scope:**
- IN: Merge 5 existing ce skills with superpowers counterparts, add 4 new skills to ce, merge superpowers' CSO guidance into `configuring-claude`
- OUT: Superpowers' `using-superpowers` meta-skill (ce uses CLAUDE.md activation), `dispatching-parallel-agents` (covered by `executing-plans`), `requesting-code-review` (covered by `/ce:review`), superpowers' `code-reviewer` agent (ce's is more comprehensive). No changes to ce commands, agents, or hooks.

**Success Criteria:**
- [ ] All 5 existing ce skills enriched with superpowers concepts
- [ ] 4 new skills created in ce plugin
- [ ] CSO guidance merged into `configuring-claude`
- [ ] No duplicate concepts between ce and superpowers
- [ ] All skill frontmatter follows ce conventions (name, description only)
- [ ] All cross-references use `ce:` namespace, not `superpowers:`
- [ ] No residual superpowers language (`superpowers:`, `your human partner`, `Jesse`, `Circle K`, `docs/superpowers/`) in any modified file
- [ ] New skills discoverable through normal activation (CLAUDE.md auto-generated sections update on plugin reload)

## Context Loading

_Run before starting:_

```bash
# CE skills directory
glob plugins/ce/skills/**/SKILL.md

# Superpowers skills to port
read /Users/broderick.westrope/dev/helse/superpowers/skills/brainstorming/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/finishing-a-development-branch/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/receiving-code-review/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/using-git-worktrees/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/test-driven-development/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/subagent-driven-development/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/writing-skills/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/writing-plans/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/verification-before-completion/SKILL.md
read /Users/broderick.westrope/dev/helse/superpowers/skills/systematic-debugging/SKILL.md

# Supporting files referenced by superpowers skills
read /Users/broderick.westrope/dev/helse/superpowers/skills/test-driven-development/testing-anti-patterns.md

# CE skill to be updated with CSO guidance
read plugins/ce/skills/configuring-claude/references/skills.md
```

## Ordering Notes

- Tasks 1-5 (new skills) are additive and can run in parallel with each other
- Tasks 3 and 4 cross-reference each other (`using-git-worktrees` ↔ `finishing-a-development-branch`) — create both before verifying cross-references
- Tasks 6-10 (enrichments) can run in parallel with each other
- Task 9 references skills from Tasks 3 and 4, so run after those are created
- Task 11 (final verification) runs last, after all other tasks

## Tasks

### New Skills

### Task 1: Add `brainstorming` skill

**Context:** `plugins/ce/skills/`, superpowers `skills/brainstorming/SKILL.md`

Port the superpowers brainstorming skill into ce. This fills a gap — ce has no pre-implementation design exploration skill.

**Adaptations from superpowers original:**
- Replace all `superpowers:` references with `ce:` equivalents (e.g., `superpowers:writing-plans` → `ce:writing-plans`)
- Remove the "visual companion" section (depends on superpowers-specific browser tooling not present in ce)
- Remove the "spec review loop" that dispatches a `spec-document-reviewer` subagent (superpowers-specific). Instead, dispatch `ce:devils-advocate` agent to review the design doc, which aligns with ce's existing plan review pattern. Note: this trades structured spec-review (completeness, requirements coverage) for general-purpose critique — an acceptable tradeoff since ce's devils-advocate already handles the "find what's missing" role
- Change spec save path from `docs/superpowers/specs/` to `docs/specs/` (or user preference)
- Remove `using-skills` and `elements-of-style:writing-clearly-and-concisely` references (not in ce)
- Keep: the hard gate (no implementation without design approval), one-question-at-a-time pattern, 2-3 approaches with tradeoffs, design-for-isolation principles, existing-codebase guidance, YAGNI emphasis
- Description should follow ce conventions: third person, "Use when..." trigger format

**Steps:**

1. [ ] Create `plugins/ce/skills/brainstorming/SKILL.md` with adapted content
2. [ ] Verify frontmatter has only `name` and `description` fields
3. [ ] Verify all cross-references use `ce:` namespace
4. [ ] Verify no superpowers-specific tooling references remain

---

### Task 2: Add `test-driven-development` skill

**Context:** `plugins/ce/skills/`, superpowers `skills/test-driven-development/SKILL.md`

This is complementary to ce's existing `writing-tests` (which covers patterns/assertions/mocking guidelines). The TDD skill covers the RED-GREEN-REFACTOR workflow discipline.

**Adaptations from superpowers original:**
- Replace `your human partner` references with neutral language (e.g., "the user", "ask the user")
- Convert the dot/graphviz RED-GREEN-REFACTOR diagram to a mermaid flowchart (this diagram visualizes the core cycle and should be kept, just in ce's preferred format)
- Read `superpowers/skills/test-driven-development/testing-anti-patterns.md` and inline any key points not already covered by `ce:writing-tests`. Reference `ce:writing-tests` for comprehensive anti-pattern guidance rather than duplicating content
- Cross-reference `ce:writing-tests` for test quality patterns (assertion strategy, mocking guidelines)
- Cross-reference `ce:verification-before-completion` for the verification step
- Keep: the Iron Law, RED-GREEN-REFACTOR cycle, rationalization table, red flags list, "delete and start over" enforcement, bug fix example
- Description: "Use when implementing any feature or bugfix, before writing implementation code"

**Steps:**

1. [ ] Create `plugins/ce/skills/test-driven-development/SKILL.md` with adapted content
2. [ ] Verify frontmatter has only `name` and `description` fields
3. [ ] Verify no superpowers-specific references remain

---

### Task 3: Add `using-git-worktrees` skill

**Context:** `plugins/ce/skills/`, superpowers `skills/using-git-worktrees/SKILL.md`

Port the git worktrees skill. Ce has no equivalent for isolated workspace setup.

**Adaptations from superpowers original:**
- Replace `superpowers:finishing-a-development-branch` reference with `ce:finishing-a-development-branch`
- Replace `superpowers:subagent-driven-development` and `superpowers:brainstorming` references with ce equivalents (`ce:executing-plans`, `ce:brainstorming`)
- Change default worktree directory from `~/.config/superpowers/worktrees/` to `~/.config/claude-code/worktrees/` (or just `.worktrees/` as primary). This path appears in both the "Ask User" prompt text AND the shell code block (lines 88-93 of original) — update both locations
- Remove "Jesse's rule" reference — keep the behavior ("fix broken things immediately") without attribution
- Keep: directory selection priority (existing > CLAUDE.md > ask), safety verification (.gitignore check), project setup auto-detection, baseline test verification, the full creation workflow

**Steps:**

1. [ ] Create `plugins/ce/skills/using-git-worktrees/SKILL.md` with adapted content
2. [ ] Verify frontmatter has only `name` and `description` fields
3. [ ] Verify no superpowers-specific paths or references remain

---

### Task 4: Add `finishing-a-development-branch` skill

**Context:** `plugins/ce/skills/`, superpowers `skills/finishing-a-development-branch/SKILL.md`

Port the branch completion workflow skill. Ce has nothing for the post-implementation "what now?" decision.

**Adaptations from superpowers original:**
- Replace `superpowers:using-git-worktrees` reference with `ce:using-git-worktrees`
- Replace `superpowers:subagent-driven-development` and `superpowers:executing-plans` references with `ce:executing-plans`
- Keep: the 5-step process (verify tests → determine base → present 4 options → execute → cleanup), confirmation gate for discard, worktree cleanup logic, quick reference table, common mistakes

**Steps:**

1. [ ] Create `plugins/ce/skills/finishing-a-development-branch/SKILL.md` with adapted content
2. [ ] Verify frontmatter has only `name` and `description` fields
3. [ ] Verify no superpowers-specific references remain

---

### Task 5: Add `receiving-code-review` skill

**Context:** `plugins/ce/skills/`, superpowers `skills/receiving-code-review/SKILL.md`

Port the code review reception skill. Ce has no guidance for responding to review feedback.

**Adaptations from superpowers original:**
- Replace "your human partner" with "the user" throughout
- Remove the "Circle K" signal phrase (personal to superpowers author)
- Remove "your human partner's rule" attributions — keep the rules themselves as general principles
- Keep: the READ→UNDERSTAND→VERIFY→EVALUATE→RESPOND→IMPLEMENT pattern, forbidden performative responses, unclear feedback handling, source-specific handling (user vs external reviewer), YAGNI check, pushback guidance, implementation ordering, GitHub thread reply guidance
- Tone down the anti-gratitude enforcement slightly — ce's style is less prescriptive about social norms. Keep the core message (verify before agreeing, push back when wrong) but soften "NEVER say thanks" to "prefer technical acknowledgment over performative agreement"

**Steps:**

1. [ ] Create `plugins/ce/skills/receiving-code-review/SKILL.md` with adapted content
2. [ ] Verify frontmatter has only `name` and `description` fields
3. [ ] Verify no superpowers-specific language or references remain

---

### Enriching Existing Skills

### Task 6: Enrich `systematic-debugging`

**Context:** `plugins/ce/skills/systematic-debugging/SKILL.md`

Ce's version is already solid. Add one concept from superpowers.

**What to add:**
- The "3+ failed fixes → question the architecture" escalation is already present in ce's Phase 4 as a one-liner. No change needed — ce already has this.

**Actually needed:** After re-reading both versions, ce's is already the stronger version. The superpowers version is shorter and less detailed. **No changes required.**

**Steps:**

1. [ ] Re-read ce version and confirm it already covers all superpowers concepts
2. [ ] Mark as complete — no changes needed

---

### Task 7: Enrich `verification-before-completion`

**Context:** `plugins/ce/skills/verification-before-completion/SKILL.md`

Both versions are strong. The ce version already has the core concept and a Red Flags section with several items. Superpowers adds a structured rationalization prevention table and slightly stronger language.

**Precise delta (what ce is missing):**
- Ce's Red Flags section (line 59) lists hedging language, premature satisfaction, trusting agent reports, and partial checks. It does NOT include "tired/exhausted" as a red flag.
- Ce has no structured "Rationalization Prevention" table mapping excuses → rebuttals. The Red Flags section is a bullet list of behaviors to watch for, but doesn't counter specific rationalizations.
- Ce's core principle line (line 8) says "No completion claims without fresh verification evidence" — functionally identical to superpowers' iron law, but lacks the code-block emphasis that makes it scannable.

**What to add:**
- Add a "Rationalization Prevention" table after the "Red Flags" section with excuse→reality pairs: "Should work now" → run the verification, "I'm confident" → confidence ≠ evidence, "Linter passed" → linter ≠ compiler, "Agent said success" → verify independently, "Partial check is enough" → partial proves nothing, "I'm tired" → exhaustion ≠ excuse
- Format the core principle as a code block for emphasis: `` `NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE` ``
- Add "Fatigue / wanting to be done" to the Red Flags bullet list

**What NOT to add:**
- "Violating the letter is violating the spirit" — this is superpowers' style, ce keeps rules without meta-commentary
- "Claiming work is complete without verification is dishonesty" — too prescriptive for ce's tone
- The "24 failure memories" section — personal to superpowers author

**Steps:**

1. [ ] Read current ce `verification-before-completion/SKILL.md`
2. [ ] Format core principle line as a code block for emphasis
3. [ ] Add "Fatigue / wanting to be done" to the Red Flags bullet list
4. [ ] Add "Rationalization Prevention" table after the Red Flags section with the 6 excuse→reality pairs listed above
5. [ ] Verify the skill reads coherently end-to-end and no content is duplicated between Red Flags and the new table
6. [ ] Verify no superpowers-specific language leaked in

---

### Task 8: Enrich `writing-plans`

**Context:** `plugins/ce/skills/writing-plans/SKILL.md`

Ce's version focuses on subsystem grouping and parallelization. Superpowers emphasizes zero-context self-contained tasks with exact file paths, complete code examples, and exact commands with expected output.

**What to add:**
- Under the "Rules" section, add emphasis that tasks should be self-contained for agents with zero codebase context: include exact file paths (already there), complete code snippets (not "add validation"), and exact commands with expected output
- Add a "Task Structure" example showing the superpowers pattern: Files (create/modify/test), Steps with code blocks, verify commands with expected output — this is more prescriptive than ce's current template
- Add the scope check concept: if the spec covers multiple independent subsystems, suggest breaking into separate plans

**What NOT to add:**
- Superpowers' bite-sized 2-5 minute granularity — conflicts with ce's "one logical unit" sizing which is better for grouped agent execution
- Plan review loop using superpowers' `plan-document-reviewer` — ce already dispatches `ce:devils-advocate`
- Execution handoff section — ce's `/ce:execute` command handles this
- `docs/superpowers/plans/` save path — keep ce's `**/plans/YYYY-MM-DD-<feature-name>.md`
- Plan document header with superpowers-specific agentic worker instructions

**Steps:**

1. [ ] Read current ce `writing-plans/SKILL.md`
2. [ ] Add "Scope Check" section after the plan template (before Task Sizing)
3. [ ] Enhance the "Rules" section with self-contained task emphasis: complete code in plan, exact commands with expected output
4. [ ] Add richer task structure example showing files/steps/verify pattern
5. [ ] Verify the skill reads coherently end-to-end

---

### Task 9: Enrich `executing-plans`

**Context:** `plugins/ce/skills/executing-plans/SKILL.md`

Ce's version is already strong on grouping and verification. Superpowers' `subagent-driven-development` adds two valuable concepts: two-stage review (spec compliance then code quality) and implementer status handling.

**What to add:**
- In section 4 (Verify), add a "Spec compliance check" before the existing code review step. This is a lightweight check: does the implementation match the plan's requirements? Did it add unrequested features? Did it miss specified behavior? This can be done by the orchestrator or a quick subagent dispatch before the full code review.
- Add an "Implementer Status Handling" subsection to section 3 (Execute). When a sub-agent reports back, handle: DONE (proceed to verify), DONE_WITH_CONCERNS (read concerns before proceeding), NEEDS_CONTEXT (provide missing context, re-dispatch), BLOCKED (assess blocker — context problem, task too large, or plan wrong)
- Reference `ce:finishing-a-development-branch` in section 6 (Cleanup) as the recommended skill for deciding how to land the work
- Reference `ce:using-git-worktrees` in section 1 (Setup) for isolated workspace creation

**What NOT to add:**
- Model selection guidance (cheap vs standard vs capable) — ce doesn't prescribe model choices
- Per-task subagent dispatching (superpowers' approach) — ce groups by subsystem which is more efficient
- Fresh subagent per task — conflicts with ce's grouping philosophy

**Steps:**

1. [ ] Read current ce `executing-plans/SKILL.md`
2. [ ] Add "Implementer Status Handling" subsection to section 3 (Execute)
3. [ ] Add spec compliance check to section 4 (Verify), before the existing code review step
4. [ ] Add `ce:using-git-worktrees` reference to section 1 (Setup)
5. [ ] Add `ce:finishing-a-development-branch` reference to section 6 (Cleanup)
6. [ ] Verify the skill reads coherently end-to-end

---

### Task 10: Enrich `configuring-claude` with CSO guidance

**Context:** `plugins/ce/skills/configuring-claude/SKILL.md`, `plugins/ce/skills/configuring-claude/references/skills.md`

Superpowers' `writing-skills` has a critical discovery insight (Claude Search Optimization) that ce's `configuring-claude` lacks: descriptions should ONLY contain triggering conditions, never workflow summaries. When descriptions summarize workflow, Claude follows the description instead of reading the full skill.

**What to change:**
- The existing description formula on line 33 of `references/skills.md` says `[What it does] + [When to use it] + [Key capabilities]`. This directly contradicts the CSO insight that descriptions should NOT summarize what the skill does. **Update the formula** to `[When to use it] + [Triggering conditions]` and add a warning against workflow summaries
- Add a "Claude Search Optimization (CSO)" section after the existing Description section in `references/skills.md`. Include:
  - The core insight: descriptions = triggers only, never workflow summaries
  - Why: Claude may follow description shortcut instead of reading full skill body (with the tested evidence from superpowers)
  - Good/bad examples adapted from superpowers' writing-skills
  - Keyword coverage guidance (error messages, symptoms, synonyms, tools)
- Add the TDD-for-skills concept as a brief note: discipline-enforcing skills benefit from pressure testing with subagents to find rationalization loopholes

**What NOT to add:**
- The full RED-GREEN-REFACTOR for skills workflow — too lengthy, and ce authors can reference superpowers' `writing-skills` if they want the full methodology
- Token efficiency targets (150/200/500 words) — too prescriptive for ce
- The complete rationalization table for skill testing — would bloat the reference file
- Graphviz/dot diagram conventions — ce uses mermaid

**Steps:**

1. [ ] Read `plugins/ce/skills/configuring-claude/references/skills.md`
2. [ ] Update the description formula (line 33) from `[What it does] + [When to use it] + [Key capabilities]` to `[When to use it] + [Triggering conditions]`
3. [ ] Update the "Good" examples in the Description section to match the new formula (remove "what it does" portions)
4. [ ] Add "Claude Search Optimization (CSO)" section after Description section with the core insight, evidence, examples, and keyword guidance
5. [ ] Add brief note about pressure-testing discipline skills with subagents
6. [ ] Verify the reference file reads coherently end-to-end
7. [ ] Verify no superpowers-specific language leaked in

---

### Final Verification

### Task 11: Grep all modified files for residual superpowers references

**Context:** All files created or modified in Tasks 1-10

Run a sweep across all new and modified SKILL.md files to catch any un-adapted references.

**Steps:**

1. [ ] Grep all files in `plugins/ce/skills/` for: `superpowers:`, `your human partner`, `Jesse`, `Circle K`, `docs/superpowers/`, `~/.config/superpowers/`
2. [ ] Fix any matches found
3. [ ] Verify all new skills have correct frontmatter (only `name` and `description` fields, third-person description starting with "Use when...")

<!--
## Review Notes

Plan reviewed by ce:devils-advocate agent. Key findings incorporated:
- Task 7 rewritten with precise delta (what ce already has vs what's actually missing)
- Added Context Loading entries for testing-anti-patterns.md and references/skills.md
- Task 2 made explicit about graphviz→mermaid conversion (not optional)
- Task 3 calls out both locations where superpowers path appears (prompt text AND shell code)
- Task 10 now explicitly updates the conflicting description formula, not just appends
- Added Task 11 for final grep sweep of residual superpowers references
- Added ordering notes for cross-referencing dependencies between Tasks 3, 4, and 9
- Added success criterion for residual language detection
- Noted that brainstorming's spec-reviewer → devils-advocate swap is a deliberate specificity tradeoff
-->
