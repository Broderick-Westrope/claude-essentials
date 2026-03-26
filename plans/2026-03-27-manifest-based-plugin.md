# Manifest-Based OpenCode Plugin

> **Status:** COMPLETED

## Specification

**Problem:** The OpenCode plugin (`ce.js`) reads and parses 56 markdown files from disk on every startup — 32 skill files, 19 command files, and 5 agent files. This causes a noticeable delay and a flash of console output. The skill scanning and system prompt injection are entirely redundant because OpenCode already handles skill awareness natively via `SystemPrompt.skills()`.

**Goal:** Plugin startup is near-instant. A build script pre-generates a single `manifest.json` containing all commands and agents. The plugin imports it, merges into config, and registers the skills path. No filesystem scanning at runtime.

**Scope:**
- In: Build script, manifest generation, plugin rewrite, removal of dead code
- Out: Changes to command/agent/skill content, Claude Code plugin changes

**Success Criteria:**

- [ ] `node scripts/build-manifest.js` generates `.opencode/plugins/manifest.json` with 19 commands and 5 agents
- [ ] Plugin startup does zero filesystem scanning (no `readdirSync`, no `readFileSync` at load time)
- [ ] All 19 commands appear in OpenCode (`/ce-test`, `/ce-commit`, etc.)
- [ ] All 5 agents appear in OpenCode (`@ce-haiku`, `@ce-code-reviewer`, etc.)
- [ ] Skills are discoverable via OpenCode's native skill system
- [ ] No flash of text on startup

## Context Loading

_Run before starting:_

```bash
read .opencode/plugins/ce.js
read .opencode/commands/ce-test.md
read .opencode/agents/ce-haiku.md
```

## Tasks

### Task 1: Create build script and manifest

**Context:** `.opencode/commands/`, `.opencode/agents/`

**Files:**
- Create: `scripts/build-manifest.js`
- Create: `.opencode/plugins/manifest.json` (generated output)

**Steps:**

1. [ ] Create `scripts/build-manifest.js` that:
   - Reads all `.md` files from `.opencode/commands/` and `.opencode/agents/`
   - Parses YAML frontmatter and body from each
   - Builds a JSON structure: `{ commands: Record<string, Command>, agents: Record<string, Agent> }`
   - Command shape: `{ template, description?, agent?, model?, subtask? }`
   - Agent shape: `{ prompt, description?, mode?, model?, color? }`
   - Writes to `.opencode/plugins/manifest.json`
2. [ ] Run the script to generate the initial manifest
3. [ ] Verify the manifest contains 19 commands and 5 agents with correct structure

**Verify:**
```bash
node scripts/build-manifest.js
node -e "const m = JSON.parse(require('fs').readFileSync('.opencode/plugins/manifest.json')); console.log('commands:', Object.keys(m.commands).length, 'agents:', Object.keys(m.agents).length)"
# Expected: commands: 19 agents: 5
```

### Task 2: Rewrite plugin to use manifest

**Context:** `.opencode/plugins/ce.js`, `.opencode/plugins/manifest.json`

**Files:**
- Rewrite: `.opencode/plugins/ce.js`

**Steps:**

1. [ ] Rewrite `ce.js` to:
   - Import `manifest.json` (via `fs.readFileSync` + `JSON.parse` or dynamic import)
   - Resolve the skills path from `__dirname`
   - Return a single `config` hook that:
     - Pushes the skills path to `config.skills.paths`
     - Merges `manifest.commands` into `config.command`
     - Merges `manifest.agents` into `config.agent`
   - No other hooks (remove `experimental.chat.system.transform`)
2. [ ] Remove all dead code: `extractFrontmatter`, `truncateDescription`, `scanSkills`, `scanCommands`, `scanAgents`, `detectProjectTools`, `buildExample`, `buildSkillsPrompt`
3. [ ] The entire plugin should be ~30 lines

**Verify:**
```bash
node -e "
import('./ce.js').then(async (mod) => {
  const hooks = await mod.ClaudeEssentialsPlugin({ client: null, directory: '/tmp/test' });
  const config = {};
  await hooks.config(config);
  console.log('skills:', config.skills.paths.length);
  console.log('commands:', Object.keys(config.command).length);
  console.log('agents:', Object.keys(config.agent).length);
})
"
# Expected: skills: 1, commands: 19, agents: 5
```
