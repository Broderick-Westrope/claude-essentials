# Genericize Tool References Plan

> **Status:** DRAFT

## Specification

**Problem:** Skills, commands, and agents reference Claude Code-specific tool names (`Task tool`, `AskUserQuestion`, `TodoWrite`, `Skill(ce:name)`, `mcp__ide__getDiagnostics`, `allowed-tools`). This prevents the plugin from working on OpenCode or other AI coding tools without a translation layer.

**Goal:** All shared files (skills, commands, agents) use provider-agnostic language for tool references. The instructions describe *intent* rather than *specific tool names*, so they work regardless of which provider is interpreting them. Platform-specific frontmatter (like `allowed-tools`) is handled separately in the OpenCode migration plan.

**Scope:**
- IN: Genericize tool references in skills (SKILL.md + references/), commands, and agents
- OUT: Frontmatter changes (`allowed-tools`, `tools`, `model` — those are platform-specific and handled in the OpenCode migration plan), new features

**Success Criteria:**
- [ ] No Claude Code-specific tool names remain in prose/instruction text (body content)
- [ ] `Skill(ce:name)` syntax replaced with provider-agnostic phrasing
- [ ] `Task tool` / `via Task tool` replaced with generic subagent language
- [ ] `AskUserQuestion` replaced with generic "ask the user" language
- [ ] `TodoWrite`/`TodoRead` replaced with generic task tracking language
- [ ] `mcp__` references replaced with generic equivalents or capability descriptions
- [ ] Claude Code plugin still works (these tools still match by intent)
- [ ] `configuring-claude` skill explicitly noted as Claude Code-specific (exempt from genericizing)

## Audit Results

### Category 1: `Skill(ce:name)` invocations — 64 occurrences

**In skills (45 hits):** Cross-references between skills. Used in:
- `configuring-claude/` (references to writer, handling-errors, verification, documenting-systems)
- `systematic-debugging/` (references reading-logs)
- `handling-errors/` (references writer)
- `drafting-tsds/` (references architecting-systems, writer, documenting-systems, visualizing-with-mermaid, strategy-writer, systematic-debugging)
- `scaffolding-plan-tests/` (related skills section)
- `executing-plans/` (code-reviewer dispatch)
- `writing-plans/` (devils-advocate dispatch)

**In commands (19 hits):** Skill loading instructions. Used in:
- `commit.md`, `debug.md`, `document.md`, `draft-tsd.md`, `execute.md`, `init.md`, `optimize.md`, `plan.md`, `post-mortem.md`, `pr.md`, `scaffold-tests.md`

**Generic replacement:** `Skill(ce:name)` → `load the **name** skill` or `use the **name** skill`

### Category 2: `Task tool` / subagent dispatch — 8 occurrences

**In commands:** `test.md`, `commit.md`, `deps.md`, `document.md`, `draft-tsd.md`, `pr.md`, `review.md`
- Pattern: "invoke the `ce:haiku` agent via Task tool"
- Pattern: "Spawn a general subagent (using Task tool)"

**In skills:** `executing-plans/SKILL.md`, `writing-plans/SKILL.md`
- Pattern: "dispatch the `ce:devils-advocate` agent via Task tool"
- Pattern: "Task tool (general-purpose):"

**Generic replacement:** "dispatch/invoke as a subagent" or "delegate to the **name** agent"

### Category 3: `AskUserQuestion` — 18 occurrences

**In skills:**
- `executing-plans/SKILL.md` (1 hit) — "use `AskUserQuestion` before starting"
- `writing-plans/SKILL.md` (1 hit) — "use `AskUserQuestion` before writing"
- `configuring-claude/` (16 hits) — Claude Code-specific authoring guide (exempt)

**Generic replacement:** "ask the user" or "prompt the user for input"

### Category 4: `TodoWrite`/`TodoRead` — 1 occurrence

**In agents:** `code-reviewer.md` frontmatter `tools:` field only (frontmatter, not prose — handled in OpenCode migration plan)

**No prose references found.** No changes needed.

### Category 5: `mcp__` tools — 2 occurrences

**In agents:** `code-reviewer.md`
- Frontmatter: `tools: ... mcp__ide__getDiagnostics`
- Body: "call `mcp__ide__getDiagnostics` with specific file URIs"

**Generic replacement:** "check IDE diagnostics for each changed file" (capability description)

### Category 6: `allowed-tools` frontmatter — 19 occurrences (all commands)

**Platform-specific frontmatter.** Not genericized here — handled in the OpenCode migration plan where OpenCode commands get different frontmatter.

### Category 7: `configuring-claude` skill — exempt

This skill is explicitly about writing Claude Code configuration. Its references to `AskUserQuestion`, `TodoWrite`, `Skill()`, and `Task` are teaching Claude Code patterns and should NOT be genericized. It may need an OpenCode equivalent skill later.

## Context Loading

```bash
# Files to modify
grep -rln "Skill(ce:\|Task tool\|AskUserQuestion\|mcp__" plugins/ce/skills/ plugins/ce/commands/ plugins/ce/agents/ --include="*.md"
```

---

## Tasks

### Group 1: Genericize Skills (largest surface area)

#### Task 1: Genericize `Skill(ce:name)` references in skills

**Context:** `plugins/ce/skills/*/SKILL.md`, `plugins/ce/skills/*/references/*.md`

**Excludes:** `plugins/ce/skills/configuring-claude/` (Claude Code-specific, exempt)

**Replacement patterns:**
| Before | After |
|---|---|
| `Skill(ce:reading-logs)` | `load the **reading-logs** skill` |
| `Use \`Skill(ce:writer)\` with The Architect persona` | `Use the **writer** skill with The Architect persona` |
| `Load \`Skill(ce:writing-plans)\`` | `Load the **writing-plans** skill` |
| `` `Skill(ce:architecting-systems)` - Architecture principles `` | `**architecting-systems** - Architecture principles` (in related skills lists) |
| `dispatch the \`ce:devils-advocate\` agent via Task tool` | `dispatch the **devils-advocate** agent as a subagent` |

**Steps:**
1. [ ] Update `systematic-debugging/SKILL.md` — 1 Skill() reference
2. [ ] Update `handling-errors/SKILL.md` — 1 Skill() reference
3. [ ] Update `drafting-tsds/SKILL.md` — 8 Skill() references
4. [ ] Update `drafting-tsds/references/best-practices.md` — 5 Skill() references
5. [ ] Update `scaffolding-plan-tests/SKILL.md` — related skills section
6. [ ] Update `executing-plans/SKILL.md` — 1 Skill() + 1 Task tool + 1 AskUserQuestion reference
7. [ ] Update `writing-plans/SKILL.md` — 1 Task tool + 1 AskUserQuestion reference

**Verify:** `grep -r "Skill(ce:" plugins/ce/skills/ --include="*.md" | grep -v configuring-claude | wc -l` equals 0

#### Task 2: Genericize `Skill(ce:name)` references in commands

**Context:** `plugins/ce/commands/*.md`

**Replacement patterns:**
| Before | After |
|---|---|
| `` Load the writing-plans skill for guidance: `Skill(ce:writing-plans)` `` | `Load the **writing-plans** skill for guidance.` |
| `` Use the `Skill(ce:systematic-debugging)` skill `` | `Use the **systematic-debugging** skill` |
| `` `Skill(ce:preflight-checks)` `` | `the **preflight-checks** skill` |

**Steps:**
1. [ ] Update `plan.md` — 1 reference
2. [ ] Update `debug.md` — 2 references
3. [ ] Update `commit.md` — 2 references (preflight-checks, writer)
4. [ ] Update `document.md` — 3 references (documenting-code-comments, documenting-systems, visualizing-with-mermaid)
5. [ ] Update `draft-tsd.md` — 5 references
6. [ ] Update `execute.md` — 2 references
7. [ ] Update `init.md` — 1 reference
8. [ ] Update `optimize.md` — reference to "Skill tool" and skill name
9. [ ] Update `post-mortem.md` — 1 reference
10. [ ] Update `pr.md` — 1 reference (writer)
11. [ ] Update `scaffold-tests.md` — 2 references

**Verify:** `grep -r "Skill(ce:" plugins/ce/commands/ --include="*.md" | wc -l` equals 0

---

### Group 2: Genericize Subagent & Interactive Tool References (parallel with Group 1)

#### Task 3: Genericize `Task tool` and `AskUserQuestion` in commands

**Context:** `plugins/ce/commands/*.md`

**Replacement patterns:**
| Before | After |
|---|---|
| `invoke the \`ce:haiku\` agent via Task tool` | `delegate to the **haiku** agent as a subagent` |
| `**DELEGATION ONLY**: ... invoke the \`ce:haiku\` agent via Task tool` | `**DELEGATION ONLY**: ... delegate to the **haiku** agent as a subagent` |
| `Spawn a general subagent (using Task tool)` | `Spawn a general-purpose subagent` |
| `## Task Prompt for Haiku Agent` | `## Subagent Prompt for Haiku` |
| `Task(ce:devils-advocate)` | `Dispatch the **devils-advocate** agent as a subagent` |

**Steps:**
1. [ ] Update `test.md` — Task tool delegation
2. [ ] Update `deps.md` — Task tool delegation
3. [ ] Update `pr.md` — Task tool delegation
4. [ ] Update `commit.md` — Task tool delegation (Path B)
5. [ ] Update `document.md` — Task tool delegation
6. [ ] Update `draft-tsd.md` — Task() dispatch
7. [ ] Update `review.md` — Task tool delegation (if present)

**Verify:** `grep -r "Task tool\|via Task" plugins/ce/commands/ --include="*.md" | wc -l` equals 0

#### Task 4: Genericize `mcp__` and remaining references in agents

**Context:** `plugins/ce/agents/*.md`

**Steps:**
1. [ ] Update `code-reviewer.md` body:
   - Replace `call \`mcp__ide__getDiagnostics\` with specific file URIs` → `check IDE diagnostics for each changed file (if IDE diagnostics tool is available)`
2. [ ] Update `log-reader.md` body:
   - Replace `Skill(ce:reading-logs)` → `load the **reading-logs** skill`

**Note:** Frontmatter fields (`tools:`, `skills:`) are NOT changed here — they're platform-specific and handled in the OpenCode migration plan.

**Verify:** `grep -r "mcp__\|Skill(ce:" plugins/ce/agents/ --include="*.md" | grep -v "^.*:tools:\|^.*:skills:" | wc -l` equals 0

---

### Group 3: Validation

#### Task 5: Verify Claude Code compatibility

**Context:** All modified files

**Steps:**
1. [ ] Run a syntax check on all modified YAML frontmatter
2. [ ] Verify no frontmatter was accidentally changed (only prose body)
3. [ ] Spot-check 3 commands in Claude Code: `/ce:test`, `/ce:plan`, `/ce:debug` — the generic language should still trigger the right tool calls since Claude Code interprets intent
4. [ ] Verify `configuring-claude` skill is untouched (exempt)
5. [ ] Final grep: confirm zero hits for `Skill(ce:` outside of `configuring-claude/`

**Verify:** `grep -r "Skill(ce:\|Task tool\|via Task tool\|mcp__ide" plugins/ce/ --include="*.md" | grep -v configuring-claude | wc -l` equals 0

---

## Replacement Summary

| Pattern | Count | Replacement |
|---|---|---|
| `Skill(ce:name)` | ~64 (45 skills + 19 commands) | `the **name** skill` / `load the **name** skill` |
| `Task tool` / `via Task tool` | ~8 | `as a subagent` / `delegate to the **name** agent` |
| `Task(ce:name)` | ~2 | `dispatch the **name** agent as a subagent` |
| `AskUserQuestion` | ~2 (outside configuring-claude) | `ask the user` / `prompt the user` |
| `mcp__ide__getDiagnostics` | ~1 (prose) | `check IDE diagnostics` |
| `configuring-claude/` refs | ~16 | **EXEMPT** (Claude Code-specific skill) |
| `allowed-tools` frontmatter | 19 | **NOT CHANGED** (platform-specific, separate plan) |
| `tools:` agent frontmatter | 2 | **NOT CHANGED** (platform-specific, separate plan) |
