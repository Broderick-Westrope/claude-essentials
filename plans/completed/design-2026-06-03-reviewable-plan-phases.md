# Reviewable Plan Phases Design Spec

**Problem:** The writing-plans skill splits large plans into multiple phase files based on an arbitrary ~500 line threshold. This has no relationship to how humans actually review the resulting code changes. A 200-line plan crossing three unrelated domains is harder to review than an 800-line plan in a single domain, but the current heuristic treats them backwards. Additionally, the existing "Scope Check" section and Rule 6 tell the LLM to split multi-domain work into entirely separate plans, which loses the coordination and sequencing benefits of keeping related work in one plan.

**Goal:** Plan phases map to PR-sized vertical slices that a human reviewer can hold in their head, approve, and merge independently. Splitting is driven by reviewability — whether a reviewer would need to context-switch between unrelated domains — not file size. Phases are human-orchestrated: the human runs each phase, reviews the PR, merges, then proceeds to the next.

**Scope:**
- In: The "Large Plans" section of the writing-plans skill, the multi-phase folder structure, and the README template
- In: The splitting heuristic and phase boundary documentation
- In: The "Scope Check" section and Rule 6 — updated to align with phases instead of separate plans
- Out: Task sizing, task grouping, parallelization within phases, the plan template for single-phase plans, the grilling skill, the executing-plans skill

**Constraints:**
- Simple single-domain plans must remain as a single file with no structural overhead
- The existing task group parallelization model (tasks under the same `##` heading run in one agent, groups across subsystems run in parallel) must be preserved within each phase
- Phase is a higher-level concept than task groups — a phase may contain multiple task groups
- Phases are human-orchestrated (run phase, review PR, merge, proceed) — the executing-plans skill does not need phase awareness

**Success Criteria:**
- [ ] The ~500 line heuristic is removed from the writing-plans skill
- [ ] The skill describes when to split based on reviewer context-switching across independent domains
- [ ] Each phase boundary includes a one-sentence rationale in the README
- [ ] Phases are sequential by default with an explicit parallel annotation for independent phases
- [ ] The multi-phase README template includes a reviewer guide (1-2 sentences per phase: what it delivers, what to review)
- [ ] Single-domain plans are unaffected (no splitting, no new structure)
- [ ] Scope Check and Rule 6 are updated to use phases instead of recommending separate plans
- [ ] Cross-cutting concerns (migrations, shared types) are addressed as a foundational phase

**Design Decisions:**
- **Reviewability over line count:** The splitting criterion is "would a reviewer need to context-switch between unrelated domains to understand the diff?" Line count was removed entirely rather than kept as a soft warning, because it sends the wrong signal — a long single-domain plan is fine, a short multi-domain plan should split. No magic number threshold — the LLM evaluates whether the domains are independent enough that reviewing them together would burden the reviewer.
- **Phase as a higher-level concept:** A phase is a reviewable vertical slice that may contain multiple task groups. This preserves the existing parallelization model (task groups within a phase still run in parallel) while adding the human review boundary on top.
- **Sequential by default:** Phases are ordered sequentially (phase 2 depends on phase 1 being merged) with an explicit parallel annotation for independent phases. This keeps the common case simple and gives the reviewer useful sequencing context. The annotation is a `(parallel)` marker in the README phase table — no machine-parseable syntax needed since phases are human-orchestrated.
- **Human-orchestrated execution:** Phases are not agent-orchestrated. The human runs each phase via the executing-plans skill (e.g., `/ce:execute phase-1-foundation.md`), reviews the resulting PR, merges, then proceeds. The README is the coordination mechanism. This means the executing-plans skill does not need modification. Each phase file should note "create PR for human review" rather than auto-merging, since the human controls the merge gate between phases.
- **Scope Check reconciliation:** The existing Scope Check ("multiple independent subsystems → separate plans") and Rule 6 are updated. The new guidance: if the work shares a goal and timeline, it stays as one plan with phases. If the domains are truly independent projects with no shared goal (e.g., "build a chat app AND redesign the billing page"), they become separate plans. Phases are for coordinated multi-domain work; separate plans are for unrelated work items.
- **Cross-cutting concerns:** Work that touches every domain (database migrations, shared type refactors, observability) becomes a foundational phase that runs first. This avoids duplicating cross-cutting work across domain phases and gives reviewers a clean "infrastructure first, features second" progression.
- **Brief boundary rationale:** Each phase boundary gets a one-sentence explanation in the README (e.g., "Phase boundary: separates auth domain from billing domain so each PR is single-domain reviewable"). Costs almost nothing to write, helps reviewers understand the plan structure.
- **Phase count guidance:** If a plan has more than 4-5 phases, reconsider whether this is truly one coordinated effort or should be decomposed into separate plans.
- **README as reviewer guide:** The multi-phase README includes what each phase delivers and what to focus on during review, so the reviewer gets front-loaded context rather than piecing it together from diffs.

**README Template:**

```markdown
# [Feature Name] Implementation Plan

> **Status:** DRAFT | APPROVED | IN_PROGRESS | COMPLETED

## Overview

[1-2 sentence summary of the full feature and why it's phased. Include Problem/Goal from the spec so reviewers understand the full picture without reading every phase file.]

## Phases

| # | File | Delivers | Depends on | Review focus |
|---|------|----------|------------|--------------|
| 1 | `phase-1-foundation.md` | Database migration + shared types | — | Schema design, index choices |
| 2 | `phase-2-auth.md` | Auth service + API endpoints | Phase 1 | Access control, token handling |
| 3 | `phase-3-billing.md` (parallel) | Billing integration | Phase 1 | Stripe webhook idempotency |

> Parallel phases can be developed and merged in either order — they share no code dependencies beyond their prerequisite phase.

## Phase Boundaries

- **1 → 2:** Foundation phase isolates schema/type changes so they're reviewed before domain logic builds on them.
- **1 → 3:** Billing is independent of auth; both depend on foundation types. Marked parallel.
```

**Context Files:**
- `plugins/ce/skills/writing-plans/SKILL.md` — the skill being modified (including Scope Check section and Rule 6)
- `plugins/ce/skills/executing-plans/SKILL.md` — the execution counterpart (confirmed: no modification needed, phases are human-orchestrated)
