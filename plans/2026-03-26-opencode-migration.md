# CE Plugin OpenCode Migration Plan

> **Status:** COMPLETED

## Specification

**Problem:** The ce plugin (claude-essentials) only works with Claude Code. OpenCode uses a different plugin architecture — JS modules, filesystem-based command/agent discovery (not plugin-bundled), and programmatic hooks instead of shell scripts. Users switching to OpenCode lose access to all 32 skills, 19 commands, and 5 agents.

**Goal:** A dual-platform plugin under the unified `ce` namespace. Skills are shared. Commands and agents are adapted per platform with `ce-` prefix for OpenCode (since OpenCode doesn't auto-namespace). The JS plugin auto-symlinks commands/agents into user projects. Installation is a one-liner.

**Scope:**
- IN: OpenCode JS plugin adapter, `.opencode/commands/` (ce- prefixed), `.opencode/agents/` (ce- prefixed), auto-symlink hook, bootstrap injection, tool mapping, git-based distribution, installation docs
- OUT: Cursor/Codex/Gemini support, new skills or commands, changes to shared skill content

**Success Criteria:**
- [ ] `opencode.json` plugin config installs ce and discovers all 32 skills
- [ ] JS plugin auto-symlinks `commands/` and `agents/` into project `.opencode/` on session start
- [ ] Bootstrap context injected with dynamic skills list and tool mapping
- [ ] All 19 commands available as `/ce-*` in OpenCode
- [ ] All 5 agents available as `@ce-*` in OpenCode
- [ ] Existing Claude Code `ce:` plugin continues to work unchanged

## Investigation Findings (Completed)

Tested with OpenCode 1.3.0 + superpowers plugin.

| Feature | Claude Code | OpenCode | Adaptation |
|---|---|---|---|
| **Skills** | Plugin `skills/` auto-discovered | JS plugin `config` hook registers paths | JS adapter registers `plugins/ce/skills/` |
| **Commands** | Plugin `commands/` auto-discovered | Only `.opencode/commands/` filesystem | Must create `ce-*.md` files, auto-symlink |
| **Agents** | Plugin `agents/` auto-discovered | Only `.opencode/agents/` filesystem | Must create `ce-*.md` files, auto-symlink |
| **Per-agent model** | `model: haiku` | `model: anthropic/claude-haiku-4-20250514` | Supported, different format |
| **Agent `skills` field** | Auto-loads skills | Not supported | Inline skill loading in prompt body |
| **`allowed-tools`** | Restricts command tools | Not supported | Use `permission` on agents |
| **Subagent dispatch** | `Task` tool | `@mention` or auto-dispatch | Replace Task refs in commands |
| **Plugin custom tools** | Not supported | `tool()` helper | Available if needed |

**Key constraints:**
- OpenCode plugins CANNOT register commands/agents programmatically — filesystem only
- Plugins CAN hook `session.created` to set up symlinks
- Skills path registration via `config` hook works (confirmed with superpowers)

## Context Loading

```bash
# Current ce plugin structure
for f in plugins/ce/commands/*.md; do echo "=== $(basename $f) ==="; head -6 "$f"; echo; done
for f in plugins/ce/agents/*.md; do echo "=== $(basename $f) ==="; head -8 "$f"; echo; done

# Superpowers reference adapter
cat /Users/broderick.westrope/dev/helse/superpowers/.opencode/plugins/superpowers.js
```

## Repo Structure

```
claude-essentials/                 (repo root)
├── package.json                   # NEW: type:module, main → .opencode/plugins/ce.js
├── .opencode/
│   ├── plugins/
│   │   └── ce.js                  # NEW: JS adapter (skills reg + bootstrap + auto-symlink)
│   ├── commands/                  # NEW: 19 OpenCode-adapted command files
│   │   ├── ce-test.md            #   → /ce-test
│   │   ├── ce-plan.md            #   → /ce-plan
│   │   ├── ce-commit.md          #   → /ce-commit
│   │   └── ...
│   ├── agents/                    # NEW: 5 OpenCode-adapted agent files
│   │   ├── ce-code-reviewer.md   #   → @ce-code-reviewer
│   │   ├── ce-haiku.md           #   → @ce-haiku
│   │   └── ...
│   └── INSTALL.md                 # NEW: Installation guide
├── plugins/ce/                    # UNCHANGED: Claude Code plugin
│   ├── .claude-plugin/
│   ├── commands/                  # Claude Code commands (ce: prefix)
│   ├── skills/                    # Shared skills (registered by JS adapter)
│   ├── agents/                    # Claude Code agents (ce: prefix)
│   └── hooks/
└── ...
```

---

## Prerequisites

- **[Genericize Tool References](./2026-03-26-genericize-tool-references.md)** — must be completed first. Replaces Claude Code-specific tool names (`Skill(ce:name)`, `Task tool`, `AskUserQuestion`, `mcp__`) with provider-agnostic language in all shared files. This eliminates the need for a runtime tool mapping translation layer.

## Tasks

### Group 1: JS Adapter

#### Task 1: Create OpenCode JS plugin adapter

**Context:** `plugins/ce/hooks/session-start.sh`, superpowers adapter

The JS adapter has three responsibilities:
1. Register skills path
2. Inject bootstrap context (skills list + activation instructions)
3. Auto-symlink commands and agents into user's project

**Steps:**
1. [ ] Create `.opencode/plugins/ce.js` with `CEPlugin` export:
   ```js
   export const CEPlugin = async ({ client, directory }) => {
     const pluginRoot = path.resolve(__dirname, '../..');
     const ceRoot = path.join(pluginRoot, 'plugins/ce');
     return {
       config: async (config) => { /* register skills path */ },
       'experimental.chat.system.transform': async (_input, output) => { /* inject bootstrap */ },
       'session.created': async () => { /* auto-symlink commands + agents */ },
     };
   };
   ```
2. [ ] **Config hook**: Register `plugins/ce/skills/` in `config.skills.paths`
3. [ ] **Bootstrap hook**: Port session-start.sh logic to JS:
   - Scan `plugins/ce/skills/*/SKILL.md` frontmatter for name + description
   - Build skills list with `ce:` prefix (skills keep ce: since they're shared)
   - Include skill activation instructions (evaluate → activate → implement)
   - Port project tooling detection (package.json, go.mod, tsconfig, etc.)
4. [ ] **Auto-symlink hook**: On `session.created`, create symlinks:
   - From plugin's `.opencode/commands/` → project's `.opencode/commands/` (per ce-*.md file)
   - From plugin's `.opencode/agents/` → project's `.opencode/agents/` (per ce-*.md file)
   - Skip if symlinks already exist; don't overwrite user files
   - Log what was symlinked for transparency
5. [ ] Create `package.json` at repo root:
   ```json
   {
     "name": "claude-essentials",
     "version": "2.7.0",
     "type": "module",
     "main": ".opencode/plugins/ce.js"
   }
   ```

**Verify:** `node -e "import('./.opencode/plugins/ce.js').then(m => console.log(Object.keys(m)))"` exports `CEPlugin`. Manual: install in test project, verify skills listed and symlinks created.

---

### Group 2: Port Commands (parallel with Group 3)

#### Task 3: Port commands to `.opencode/commands/`

**Context:** `plugins/ce/commands/*.md`, (genericize plan completed as prerequisite)

Create 19 `ce-*.md` files with OpenCode-adapted frontmatter and body.

**Frontmatter mapping:**

| Claude Code | OpenCode |
|---|---|
| `description: ...` | `description: ...` (same) |
| `argument-hint: "..."` | `argument-hint: "..."` (same) |
| `allowed-tools: Task` | Remove (not supported) |
| `allowed-tools: Bash, Read, ...` | Remove |
| (none) | `subtask: true` (for commands delegating to subagent) |
| (none) | `agent: ce-haiku` (for commands targeting specific agent) |

**Body adaptations by command type:**

**Skill-loading commands** (minimal changes):
- `ce-plan.md`, `ce-debug.md`, `ce-optimize.md`, `ce-refactor.md`, `ce-scaffold-tests.md`
- Replace `Skill(ce:name)` → `skill({ name: "ce:name" })`

**Delegation commands** (replace Task with subtask/agent):
- `ce-test.md`, `ce-commit.md`, `ce-pr.md`, `ce-deps.md`, `ce-explain.md`
- Remove "DELEGATION ONLY" pattern; set `agent: ce-haiku` + `subtask: true` in frontmatter
- Keep the prompt template as the command body

**Hybrid commands** (skill + delegation):
- `ce-review.md`, `ce-document.md`, `ce-fix-issue.md`, `ce-execute.md`, `ce-draft-tsd.md`
- `ce-init.md`, `ce-audit-context.md`, `ce-review-with-me.md`, `ce-post-mortem.md`
- Replace both Skill() and Task references

**Steps:**
1. [ ] Create `.opencode/commands/` directory
2. [ ] Port the 5 skill-loading commands
3. [ ] Port the 5 delegation commands
4. [ ] Port the 9 hybrid commands
5. [ ] Validate all 19 files have valid YAML frontmatter

**Verify:** `ls .opencode/commands/ce-*.md | wc -l` equals 19. `head -6 .opencode/commands/ce-*.md` shows valid frontmatter.

---

### Group 3: Port Agents (parallel with Group 2)

#### Task 4: Port agents to `.opencode/agents/`

**Context:** `plugins/ce/agents/*.md`, (genericize plan completed as prerequisite)

Create 5 `ce-*.md` files with OpenCode-adapted frontmatter and body.

**Frontmatter mapping:**

| Claude Code field | OpenCode field |
|---|---|
| `name: code-reviewer` | `name: ce-code-reviewer` |
| `description: ...` | `description: ...` (same) |
| (none) | `mode: subagent` (required) |
| `model: haiku` | `model: anthropic/claude-haiku-4-20250514` |
| `model: sonnet` | `model: anthropic/claude-sonnet-4-20250514` |
| `tools: Bash, Read, ...` | Remove; use `permission` instead |
| `skills: ce:x, ce:y` | Remove; add to prompt body |
| `color: red` | `color: red` (same) |

**Steps:**
1. [ ] Create `.opencode/agents/` directory
2. [ ] Port `ce-code-reviewer.md`:
   - `mode: subagent`, `model: anthropic/claude-sonnet-4-20250514`
   - Move `skills: ce:documenting-code-comments, ce:handling-errors, ce:writing-tests` into prompt body as: "First load these skills: `skill({ name: 'ce:documenting-code-comments' })`, ..."
   - Map `tools: Bash, Glob, Grep, Read, TodoWrite, mcp__ide__getDiagnostics` to `permission` field
3. [ ] Port `ce-haiku.md`:
   - `mode: subagent`, `model: anthropic/claude-haiku-4-20250514`
   - Replace tool references in body
4. [ ] Port `ce-log-reader.md`:
   - `mode: subagent`, `model: anthropic/claude-haiku-4-20250514`
   - Move `skills: ce:reading-logs` into prompt body
5. [ ] Port `ce-devils-advocate.md` and `ce-context-auditor.md`:
   - `mode: subagent`
   - Adapt tool/skill references

**Verify:** `ls .opencode/agents/ce-*.md | wc -l` equals 5. `grep -l "mode: subagent" .opencode/agents/*.md | wc -l` equals 5.

---

### Group 4: Docs & Validation (depends on Groups 1-3)

#### Task 5: Create installation docs

**Context:** superpowers install docs

**Steps:**
1. [ ] Create `.opencode/INSTALL.md`:
   - Prerequisites: OpenCode installed
   - Installation: `"plugin": ["claude-essentials@git+https://github.com/rileyhilliard/claude-essentials.git"]`
   - Explain auto-symlink behavior (commands/agents appear automatically on first session)
   - Verification: "ask OpenCode to list skills, try `/ce-test`"
   - Troubleshooting: plugin not loading, skills not found, symlinks not created
2. [ ] Update `README.md` with dual-platform installation (Claude Code + OpenCode)
3. [ ] Update `CLAUDE.md` to document the multi-platform architecture

**Verify:** Docs reference correct git URL and describe auto-symlink behavior

#### Task 6: End-to-end validation

**Context:** All prior outputs

**Steps:**
1. [ ] Clean test: new project, add plugin to `opencode.json`, start OpenCode session
2. [ ] Verify auto-symlink: `.opencode/commands/ce-*.md` and `.opencode/agents/ce-*.md` appear in project
3. [ ] Verify skills: list skills → 32 with `ce:` prefix
4. [ ] Verify bootstrap: session has skills activation instructions + tool mapping
5. [ ] Test commands: `/ce-plan "add auth"`, `/ce-test`, `/ce-commit`
6. [ ] Test agents: `@ce-code-reviewer` review some code, `@ce-haiku` runs on haiku model
7. [ ] Claude Code regression: install ce via marketplace, run `/ce:test` → still works
8. [ ] Create `.opencode/KNOWN-LIMITATIONS.md` if any gaps found

**Verify:** Both platforms functional, all commands/agents/skills accessible

---

## Known Limitations

1. **No `allowed-tools` on commands:** OpenCode commands have full tool access. Agent-level `permission` provides partial mitigation.

2. **Agent `skills` field not supported:** Skill loading instructions are inlined in agent prompt body. If upstream skills are renamed, OpenCode agent files need manual update.

3. **Notification hook:** Not ported in v1. OpenCode's `session.idle` event could work but behavior differs from Claude Code's `Notification` event. Follow-up task.

4. **Bootstrap propagation to subagents:** `experimental.chat.system.transform` injects into main session. Whether subagents inherit this is unverified. May need `tool.execute.before` on task dispatch for subagent injection.

5. **Auto-symlink limitations:** If user already has a file with the same name (e.g., their own `ce-test.md`), the symlink is skipped. This prevents overwrites but means the user's version takes precedence.

## Review Notes

Devil's advocate review of initial draft:
- Caught that superpowers doesn't duplicate commands/agents — investigation confirmed duplication IS required (OpenCode can't discover from plugins)
- Caught directory structure ambiguity — resolved with OpenCode config at repo root
- Caught tool audit must precede adapter — reordered to Task 1
- `model: haiku` → confirmed supported as `anthropic/claude-haiku-4-20250514`
- `skills` field → confirmed not supported, inlined into prompt body
- `Task` → `@mention` requires thoughtful per-command adaptation, not blanket replacement

Investigation spike findings:
- Auto-symlink approach validated — `session.created` hook can create symlinks
- Skills registration confirmed working via superpowers reference
- Commands/agents are filesystem-only discovery, no programmatic registration
