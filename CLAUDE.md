# CLAUDE.md

This file provides guidance when working with code in this repository.

## Project Overview

This is a set of OpenCode configuration files (commands, agents, skills, plugins) distributed via the `OPENCODE_CONFIG_DIR` environment variable. The `config/` directory is the OpenCode config root.

**Contents:**

- **18 Commands** - Development workflows (`/ce-test`, `/ce-commit`, `/ce-review`, `/ce-plan`, etc.)
- **25 Skills** - Reusable patterns for testing, debugging, refactoring, architecture, and planning
- **5 Agents** - Expert AI personas (`@ce-code-reviewer`, `@ce-haiku`, `@ce-log-reader`, `@ce-devils-advocate`, `@ce-context-auditor`)
- **1 Plugin** - Notification plugin (`notify.ts`)

**Naming conventions:**

- Commands: `/ce-test`, `/ce-commit`, `/ce-plan`, etc. (hyphen prefix, no colon)
- Skills: `writing-tests`, `systematic-debugging`, `architecting-systems`, etc. (no prefix)
- Agents: `@ce-haiku`, `@ce-code-reviewer`, etc. (hyphen prefix, no colon)

## Directory Structure

```
claude-essentials/
├── install.sh                    # Adds OPENCODE_CONFIG_DIR to shell profile
├── uninstall.sh                  # Removes it
├── config/                       # OPENCODE_CONFIG_DIR points here
│   ├── opencode.jsonc            # Config fragment (loads ce-instructions.md)
│   ├── ce-instructions.md        # Skill activation sequence + guidelines
│   ├── commands/*.md             # 18 commands (ce-test.md, ce-commit.md, etc.)
│   ├── agents/*.md               # 5 agents (ce-haiku.md, ce-code-reviewer.md, etc.)
│   ├── skills/*/SKILL.md         # 25 skills (unchanged format)
│   └── plugins/notify.ts         # Notification plugin
├── legacy/                       # Old Claude Code files (reference only)
│   ├── .claude-plugin/
│   ├── hooks/
│   └── CLAUDE.md
├── README.md
├── LICENSE.md
└── MIGRATION.md                  # Migration plan from Claude Code plugin
```

## Key Differences from Claude Code Plugin

| Concept | Claude Code | OpenCode |
|---------|-------------|----------|
| Command names | `/ce:test` | `/ce-test` |
| Agent names | `@ce:haiku` | `@ce-haiku` |
| Skill refs | `Skill(ce:writing-tests)` | `Skill(writing-tests)` |
| Tool permissions | `allowed-tools:` frontmatter | `permission:` block in agents |
| Model names | `model: haiku` | `model: anthropic/claude-haiku-4-5` |
| Hooks | Shell scripts + hooks.json | TypeScript plugins |
| Installation | `/plugin install ce` | `./install.sh` (sets env var) |

## Development Workflow

### Validating Changes

```bash
# Check JSON config
python -m json.tool config/opencode.jsonc

# Verify all command files have valid frontmatter
for f in config/commands/*.md; do head -5 "$f"; echo "---"; done

# Verify agent files
for f in config/agents/*.md; do head -10 "$f"; echo "---"; done

# Check for stale ce: references (should be none)
grep -r 'ce:' config/ --include='*.md' | grep -v 'ce-' | grep -v 'display:' | grep -v 'service:' | grep -v 'resource:' | grep -v 'trace:' | grep -v 'instance:' | grep -v 'choice:'
```

### File Naming Conventions

- Command files: `ce-command-name.md` (kebab-case with ce- prefix)
- Agent files: `ce-agent-name.md` (kebab-case with ce- prefix)
- Skill directories: `skill-name/` (kebab-case, no prefix)
- Skill files: Always `SKILL.md` (uppercase)
- Reference files: Descriptive names (kebab-case) in `references/` subdirectory
- Plugin files: `plugin-name.ts` in `plugins/`

## Installation

```bash
git clone https://github.com/Broderick-Westrope/claude-essentials.git
cd claude-essentials
./install.sh
source ~/.zshrc  # or restart terminal
```

After that, `git pull` updates everything. No re-install needed.
