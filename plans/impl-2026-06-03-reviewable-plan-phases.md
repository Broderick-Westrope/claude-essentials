# Reviewable Plan Phases Implementation Plan

> **Status:** DRAFT

## Specification

**Problem:** The writing-plans skill splits large plans into multiple phase files based on an arbitrary ~500 line threshold. This has no relationship to how humans actually review the resulting code changes. Additionally, Scope Check and Rule 6 tell the LLM to split multi-domain work into entirely separate plans, losing coordination benefits.

**Goal:** Plan phases map to PR-sized vertical slices that a human reviewer can hold in their head, approve, and merge independently. Splitting is driven by reviewability — whether a reviewer would need to context-switch between unrelated domains — not file size.

**Scope:** The "Large Plans" section, "Scope Check" section, and Rule 6 in `plugins/ce/skills/writing-plans/SKILL.md`.

**Success Criteria:**

- [ ] The ~500 line heuristic is removed
- [ ] The skill describes when to split based on reviewer context-switching across independent domains
- [ ] Each phase boundary includes a one-sentence rationale in the README
- [ ] Phases are sequential by default with an explicit parallel annotation
- [ ] The multi-phase README template includes a reviewer guide
- [ ] Single-domain plans are unaffected
- [ ] Scope Check and Rule 6 are updated to use phases instead of separate plans
- [ ] Cross-cutting concerns are addressed as a foundational phase

## Context Loading

_Run before starting:_

```bash
view plugins/ce/skills/writing-plans/SKILL.md
```

## Tasks

### Task 1: Update Scope Check, Rule 6, and Large Plans sections

**Context:** `plugins/ce/skills/writing-plans/SKILL.md`

**Files:**
- Modify: `plugins/ce/skills/writing-plans/SKILL.md` (three sections)

**Steps:**

1. [ ] Replace the **Scope Check** section (lines 80-82) with updated guidance that distinguishes phases from separate plans:
   - If the work shares a goal and timeline → one plan with phases
   - If the domains are truly independent projects with no shared goal → separate plans
   - Replace the "auth, billing, AND notifications is probably three plans" example with one showing when phases vs. separate plans apply

2. [ ] Replace **Rule 6** (line 133) with:
   - `6. **Scope check:** If the spec spans unrelated projects with no shared goal, split into separate plans. If it spans multiple domains with a shared goal, use phases (see "Phased Plans").`

3. [ ] Replace the **Large Plans** section (lines 155-164) with a new **Phased Plans** section containing:
   - **When to phase:** Split when a reviewer would need to context-switch between unrelated domains to understand the diff. Single-domain plans stay as one file regardless of size.
   - **What a phase is:** A PR-sized vertical slice — a sub-feature that can be reviewed, approved, and merged independently. Higher-level than task groups; a phase may contain multiple task groups that still parallelize internally.
   - **Cross-cutting concerns:** Work that touches every domain (migrations, shared types, observability) becomes a foundational phase that runs first.
   - **Sequencing:** Phases are sequential by default. Independent phases get a `(parallel)` marker in the README table, meaning they can be developed and merged in either order.
   - **Phase cap:** If a plan has more than 4-5 phases, reconsider whether it should be decomposed into separate plans.
   - **Human-orchestrated execution:** Each phase is executed independently (`/ce:execute phase-N-name.md`), creates a PR for human review, and is merged before proceeding. Each phase file should note "create PR for human review" rather than auto-merging.
   - **Folder structure:** Same `**/plans/impl-YYYY-MM-DD-feature/` convention with README.md + phase files.
   - **README template:** Include the full template from the spec:
     - Overview with Problem/Goal context
     - Phase table with columns: #, File, Delivers, Depends on, Review focus
     - Parallel annotation note
     - Phase Boundaries section with one-sentence rationale per boundary

**Verify:**
```bash
# Check the file is valid markdown and the sections are properly structured
grep -n "## Scope Check\|## Phased Plans\|Scope check:" plugins/ce/skills/writing-plans/SKILL.md
# Expected: "## Scope Check" heading, "## Phased Plans" heading, updated Rule 6
# Verify ~500 line reference is gone
grep -c "500 lines" plugins/ce/skills/writing-plans/SKILL.md
# Expected: 0
```
