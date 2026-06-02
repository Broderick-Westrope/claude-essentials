# Convention Reviewer Design Spec

**Problem:** The existing dual-model review command (`/ce:review`) treats convention compliance as one bullet among many in a general code review workflow. Both the Sonnet and Opus reviewers discover project standards as a step, but neither goes deep — conventions get diluted alongside security, performance, architecture, UX, DX, and documentation concerns. Subtle convention violations slip through because no reviewer is *focused* on compliance.

**Goal:** A third parallel reviewer agent dedicated to convention compliance. It reads all convention sources deeply before reviewing the diff, evaluates every change against documented standards and inferred codebase patterns, and surfaces violations at the appropriate severity alongside existing findings.

**Scope:**

In scope:
- New `convention-reviewer` agent with Opus model and convention-focused system prompt, for all three platforms:
  - Claude Code: `plugins/ce/agents/convention-reviewer.md` (frontmatter: `name`, `description`, `tools`, `model`, `skills`, `color`)
  - OpenCode: `opencode/agents/ce-convention-reviewer.md` (frontmatter: `mode: subagent`, full model string)
  - Anvil: `anvil/agents/convention-reviewer.md` (frontmatter: `role`, `delegate_when`, `dont_delegate_when`, `delegates_to`, `routing_hint`, capability fields)
- Update review commands across all three platforms:
  - Claude Code: `plugins/ce/commands/review.md`
  - OpenCode: `opencode/commands/ce-review.md`
  - Anvil: `anvil/commands/review.md`
- Regenerate `opencode/plugins/manifest.json` via `scripts/build-manifest.js`
- Update merge logic to handle `[Convention]` attribution and 3-way deduplication
- Update command description and summary output ("Multi-model code review")
- Update verdict logic: any reviewer requesting changes → merged verdict is REQUEST CHANGES
- Update failure handling for all three-reviewer permutations
- Update `ANVIL.md` agent dependency map and per-agent table to include `convention-reviewer`

Out of scope:
- Changes to the existing `code-reviewer-opus` or `code-reviewer-sonnet` agents (their existing "Conventions" bullet stays — overlap is handled by the merge logic)
- New output sections or format changes beyond attribution tags
- Changes to the `review-with-me` command
- Convention *authoring* or *generation* tooling
- Fixing the pre-existing Anvil review command issue where it references `ce-code-reviewer-sonnet` / `ce-code-reviewer-opus` (which don't exist in `anvil/agents/` — Anvil has a single `reviewer.md` instead). This is a separate issue predating this work.

**Constraints:**
- Must run in parallel with existing reviewers (no sequential dependency)
- Output format must be compatible with existing merge logic (all findings reference file:line in the changed code)
- Each platform's agent file follows that platform's frontmatter conventions
- Must use Opus model
- Convention compliance is the primary focus; general review is opportunistic only

**Success Criteria:**
- [ ] `convention-reviewer` agent exists for all three platforms (Claude Code, OpenCode, Anvil) following each platform's conventions
- [ ] Review commands on all platforms launch three reviewers in parallel
- [ ] `manifest.json` regenerated to include the new agent
- [ ] `ANVIL.md` agent dependency map and per-agent table updated
- [ ] Convention findings appear in existing severity tiers with `[Convention]` attribution
- [ ] Findings that overlap with Sonnet/Opus on same location + same issue merge correctly
- [ ] 3-way attribution works: `[Convention]`, `[Sonnet + Convention]`, `[Opus + Convention]`, `[Sonnet + Opus + Convention]`
- [ ] Convention reviewer reads project docs (CLAUDE.md, .claude/rules, CONTRIBUTING.md, linter/formatter configs) as primary source of truth
- [ ] Falls back to inferred codebase patterns where docs are silent — this is the expected common case
- [ ] Dynamically loads skills relevant to the codebase at runtime (e.g. `euc-go` for Go projects, `euc-ts` for TypeScript — these are user/org-level skills, not in this repo)
- [ ] Contradictions between docs and codebase are surfaced as their own findings, with docs treated as authoritative
- [ ] Opportunistically flags critical bugs/security without losing convention focus
- [ ] Verdict logic: any reviewer requesting changes → merged verdict is REQUEST CHANGES (simple rule, no exhaustive matrix)
- [ ] Failure handling covers all three-reviewer permutations (one fails, two fail, all fail)
- [ ] Command description updated to "Multi-model code review"
- [ ] Summary section lists all three reviewers and agreement stats

**Design Decisions:**

- **Dedicated agent over reusing @oracle** — The generic oracle lacks a convention-focused system prompt. A purpose-built agent ensures the right workflow, skill loading, and output structure.

- **Docs authoritative over codebase** — When project docs contradict codebase patterns, the docs win. Drift between docs and code is surfaced as its own finding. This preserves the authority of documented conventions rather than letting codebase entropy silently override them.

- **Inferred conventions as the common case** — Most projects don't have explicit convention docs. The agent's primary workflow assumes it will need to infer conventions from codebase patterns (naming, structure, error handling style, test patterns). Explicit docs augment and override inferred patterns, not the other way around.

- **Dynamic skill loading at runtime** — Rather than hardcoding a skill list, the agent discovers which skills are relevant to the codebase (language, framework, tooling) and loads those. Skills like `euc-go`, `euc-ts`, `euc-graphql`, `writing-tests`, `handling-errors` are user/org-level skills installed separately — not part of this repo. The agent's system prompt instructs it to check available skills and load relevant ones, gracefully handling cases where no matching skills exist.

- **Findings in existing tiers, not a new section** — Convention violations are distributed across Critical/Important/Suggestions based on severity. This keeps the output format flat and avoids creating a separate bucket that gets treated as lower priority.

- **Opus model** — Convention checking benefits from deeper reasoning about the *intent* behind conventions, not just surface pattern matching. Worth the cost for thoroughness.

- **Opportunistic bug/security flagging** — The agent shouldn't wear blinders. If it spots a critical bug while checking conventions, it should flag it. But convention compliance remains the primary mission. When such findings overlap with what Sonnet/Opus found, the merge logic deduplicates them naturally.

- **Standard merge logic, no special cases** — Convention findings merge with Sonnet/Opus findings using the same file+line + same substance criteria. Different issues at the same location stay separate. The only extension is supporting 3-way attribution tags.

- **Simple verdict rule** — Rather than enumerating all 8 combinations of 3 binary verdicts, use a single rule: any reviewer requesting changes means the merged verdict is REQUEST CHANGES. Only unanimous APPROVE produces APPROVE.

- **Convention findings must reference diff locations** — All findings must reference file:line in the changed code, not in convention documents. A finding like "CLAUDE.md says use named exports but `src/foo.ts:12` uses default export" references `src/foo.ts:12`. This ensures compatibility with the merge algorithm. Convention-vs-codebase drift findings reference a representative example location in the diff.

- **Three-platform parity** — Claude Code, OpenCode, and Anvil all get the convention reviewer and updated review commands. Each follows its own frontmatter and file naming conventions. The agent's system prompt body is shared across platforms; only the metadata wrapper differs.

- **Existing reviewer convention overlap accepted** — The existing Sonnet/Opus reviewers have a "Conventions" bullet in their quality assessment. This stays unchanged. When the convention reviewer finds the same issue, the merge logic deduplicates it (e.g. `[Opus + Convention]`). This is a feature: dual-flagged findings have higher confidence.

- **Anvil routing: convention-reviewer is a leaf agent** — It does not sub-delegate. It is invoked through the review command, not directly by the orchestrator's routing logic. Its `delegate_when` / `dont_delegate_when` fields exist for completeness but are not expected to be the primary invocation path.

**Context Files:**
- `plugins/ce/commands/review.md` — Current Claude Code review command
- `opencode/commands/ce-review.md` — Current OpenCode review command
- `anvil/commands/review.md` — Current Anvil review command
- `plugins/ce/agents/code-reviewer-opus.md` — Existing Claude Code Opus reviewer (frontmatter pattern, workflow, output format)
- `opencode/agents/ce-code-reviewer-opus.md` — Existing OpenCode Opus reviewer (frontmatter pattern)
- `anvil/agents/reviewer.md` — Existing Anvil reviewer (frontmatter pattern, shared prompt body)
- `scripts/build-manifest.js` — Generates OpenCode manifest from `opencode/` contents
- `anvil-plugin.json` — Anvil plugin manifest (declares paths: skills → `plugins/ce/skills`, commands → `anvil/commands`, agents → `anvil/agents`)
- `ANVIL.md` — Anvil agent format spec, agent dependency map, per-agent capability table
- `CLAUDE.md` — Plugin architecture, platform conventions, skill/agent naming
