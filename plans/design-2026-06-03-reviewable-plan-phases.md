# Reviewable Plan Phases Design Spec

**Problem:** The writing-plans skill splits large plans into multiple phase files based on an arbitrary ~500 line threshold. This has no relationship to how humans actually review the resulting code changes. A 200-line plan crossing three unrelated domains is harder to review than an 800-line plan in a single domain, but the current heuristic treats them backwards.

**Goal:** Plan phases map to PR-sized vertical slices that a human reviewer can hold in their head, approve, and merge independently. Splitting is driven by reviewability — whether a reviewer would need to context-switch between unrelated domains — not file size.

**Scope:**
- In: The "Large Plans" section of the writing-plans skill, the multi-phase folder structure, and the README template
- In: The splitting heuristic and phase boundary documentation
- Out: Task sizing, task grouping, parallelization within phases, the plan template for single-phase plans, the grilling skill, the executing-plans skill

**Constraints:**
- Simple single-domain plans must remain as a single file with no structural overhead
- The existing task group parallelization model (tasks under the same `##` heading run in one agent, groups across subsystems run in parallel) must be preserved within each phase
- Phase is a higher-level concept than task groups — a phase may contain multiple task groups

**Success Criteria:**
- [ ] The ~500 line heuristic is removed from the writing-plans skill
- [ ] The skill describes when to split based on reviewer context-switching across independent domains
- [ ] Each phase boundary includes a one-sentence rationale
- [ ] Phases are sequential by default with an explicit parallel annotation for independent phases
- [ ] The multi-phase README template includes a reviewer guide (1-2 sentences per phase: what it delivers, what to review)
- [ ] Single-domain plans are unaffected (no splitting, no new structure)

**Design Decisions:**
- **Reviewability over line count:** The splitting criterion is "would a reviewer need to hold multiple unrelated domains in their head?" with subsystem boundaries (3+ independent subsystems) as the practical proxy. Line count was removed entirely rather than kept as a soft warning, because it sends the wrong signal — a long single-domain plan is fine, a short multi-domain plan should split.
- **Phase as a higher-level concept:** A phase is a reviewable vertical slice that may contain multiple task groups. This preserves the existing parallelization model (task groups within a phase still run in parallel) while adding the human review boundary on top.
- **Sequential by default:** Phases are ordered sequentially (phase 2 depends on phase 1 being merged) with an explicit "parallel" annotation for phases that don't depend on each other. This keeps the common case simple and gives the reviewer useful sequencing context.
- **Brief boundary rationale:** Each phase boundary gets a one-sentence explanation (e.g., "separates auth domain from billing domain so each PR is single-domain reviewable"). Costs almost nothing to write, helps reviewers understand the plan structure.
- **README as reviewer guide:** The multi-phase README includes what each phase delivers and what to focus on during review, so the reviewer gets front-loaded context rather than piecing it together from diffs.

**Context Files:**
- `plugins/ce/skills/writing-plans/SKILL.md` — the skill being modified
- `plugins/ce/skills/executing-plans/SKILL.md` — the execution counterpart (out of scope but useful for understanding the task group model)
