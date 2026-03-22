# Claude Essentials

Essential commands, skills, and specialized agents for [OpenCode](https://opencode.ai), distributed as a native config directory.

NOTE: This is a fork, to customise my workflow. All credit for the original files goes to https://github.com/rileyhilliard

<img src="/assets/hackerman.gif" width="100%" alt="hackerman">

## What's Included

### Commands (18)

Quick workflows for everyday development tasks, accessed with `/ce-` prefix:

| Command | Description |
| --- | --- |
| `/ce-test` | Run tests and analyze failures |
| `/ce-explain` | Break down code or concepts |
| `/ce-debug` | Launch systematic debugging |
| `/ce-optimize` | Find performance bottlenecks |
| `/ce-refactor` | Improve code quality |
| `/ce-review` | Code review with tracked findings and fix workflow |
| `/ce-commit` | Preflight checks, semantic commit, auto-fix on hook failure |
| `/ce-deps` | Audit and upgrade dependencies |
| `/ce-fix-issue` | Fix a GitHub issue by number |
| `/ce-pr` | Create a pull request with auto-generated description |
| `/ce-document` | Create or improve documentation |
| `/ce-draft-tsd` | Draft technical specification documents from rough ideas or topics |
| `/ce-plan` | Create a detailed implementation plan |
| `/ce-execute` | Execute an implementation plan from the plans folder |
| `/ce-init` | Bootstrap repo with configuration (rules, permissions, settings) |
| `/ce-audit-context` | Identify knowledge gaps in CLAUDE.md and collect human context |
| `/ce-review-with-me` | Interactive AI-assisted review where the human drives and AI provides context |
| `/ce-post-mortem` | Review a session to assess execution and extract improvements |

### Skills (25)

Reusable development patterns loaded on demand:

**Testing & Quality:**

| Skill | Description |
| --- | --- |
| `writing-tests` | Testing Trophy methodology, behavior-focused tests |
| `verification-before-completion` | Verify before claiming success |
| `preflight-checks` | Auto-detect and run project linters/formatters/checkers |

**Debugging & Problem Solving:**

| Skill | Description |
| --- | --- |
| `systematic-debugging` | Four-phase debugging framework |
| `fixing-flaky-tests` | Diagnose and fix tests that fail concurrently |
| `condition-based-waiting` | Replace race conditions with polling |
| `reading-logs` | Efficient log analysis using targeted search |

**Code Quality:**

| Skill | Description |
| --- | --- |
| `refactoring-code` | Behavior-preserving code improvements |
| `optimizing-performance` | Measurement-driven optimization |
| `handling-errors` | Error handling best practices |
| `migrating-code` | Safe migration patterns for databases, APIs, and frameworks |

**Planning & Execution:**

| Skill | Description |
| --- | --- |
| `writing-plans` | Create implementation plans with devils-advocate review |
| `executing-plans` | Execute plans with mandatory code review |
| `architecting-systems` | Clean, scalable system architecture for the build phase |
| `design` | Frontend design skill |

**Documentation & Writing:**

| Skill | Description |
| --- | --- |
| `writer` | Writing style guide with 7 personas (Architect, Engineer, PM, Marketer, Educator, Contributor, UX Writer) |
| `strategy-writer` | Executive-quality strategic documents in Economist/HBR style |
| `documenting-systems` | Best practices for writing markdown documentation |
| `documenting-code-comments` | Standards for self-documenting code and inline comments |
| `drafting-tsds` | Create draft technical specification documents exploring solution spaces before implementation |

**Data & Infrastructure:**

| Skill | Description |
| --- | --- |
| `managing-databases` | PostgreSQL, DuckDB, Parquet, and PGVector architecture |
| `managing-pipelines` | GitHub Actions CI/CD security, performance, and deployment patterns |

**Meta Skills:**

| Skill | Description |
| --- | --- |
| `visualizing-with-mermaid` | Create professional technical diagrams |
| `post-mortem` | Review sessions to extract actionable improvements |
| `configuring-claude` | Best practices for writing skills, rules, CLAUDE.md |

### Agents (5)

Expert AI personas for complex work, accessed with `@ce-` prefix:

| Agent | Description |
| --- | --- |
| `@ce-code-reviewer` | Comprehensive PR/MR reviews enforcing standards |
| `@ce-haiku` | Lightweight agent for simple delegated tasks |
| `@ce-log-reader` | Efficient log file analysis using targeted search |
| `@ce-devils-advocate` | Rigorous critique to find flaws in plans and designs |
| `@ce-context-auditor` | Analyzes codebases to identify documentation gaps requiring human knowledge |

### Plugin

- **Notifications** - Cross-platform alerts when OpenCode needs input (macOS + Linux)

---

## Installation

### Prerequisites

You need [OpenCode](https://opencode.ai) installed.

### Setup

```bash
git clone https://github.com/Broderick-Westrope/claude-essentials.git
cd claude-essentials
./install.sh
source ~/.zshrc  # or restart terminal
```

That's it. The installer adds a single `OPENCODE_CONFIG_DIR` export to your shell profile pointing at the repo's `config/` directory.

### How It Works

- No symlinks or file copying -- the repo **is** the config
- `git pull` updates everything instantly
- Personal config in `~/.config/opencode/` coexists without conflict
- One env var in your shell profile is the entire "install"

### Uninstall

```bash
./uninstall.sh
```

### Verify Installation

Start OpenCode and try:

```bash
# Try a quick command
/ce-test

# Use a skill
Skill(writing-tests)

# Use an agent
@ce-code-reviewer
```

---

## Usage Examples

### Typical Workflows

**Fix failing tests:**

```bash
/ce-test
# If complex, escalate:
Skill(systematic-debugging)
```

**Review before merge:**

```bash
/ce-review
# Review findings are tracked as a checklist, fix issues, then:
/ce-commit
```

**Optimize performance:**

```bash
/ce-optimize src/components/DataTable.tsx
```

**Plan a feature:**

```bash
/ce-plan Add real-time notifications for 10k concurrent users
```

**Review a session for improvements:**

```bash
/ce-post-mortem
```

### Understanding the System

- **Commands** (`/ce-test`, `/ce-review`) are quick keyboard shortcuts for routine tasks
- **Skills** (`writing-tests`) are reusable workflows that guide specific development patterns
- **Agents** (`@ce-code-reviewer`) are expert personas for complex, multi-step work

Use commands for quick actions, skills for following proven patterns, and agents when you need specialized expertise.

---

## Customization

All components are markdown files in the `config/` directory. Edit them directly.

### Creating Your Own Command

Add a markdown file to `config/commands/`:

```markdown
---
description: Your command description
---

Your command instructions here.
```

### Creating Your Own Skill

Add a directory with SKILL.md to `config/skills/`:

```markdown
---
name: my-skill
description: What this skill does and when to use it
---

# Skill Instructions

Your skill workflow here.
```

### Creating Your Own Agent

Add a markdown file to `config/agents/`:

```markdown
---
description: Expert at specific domain
mode: subagent
color: blue
permission:
  edit: deny
  bash:
    "*": allow
---

Your agent personality and workflow here.
```

---

## Project Structure

```
claude-essentials/
├── install.sh                # Sets OPENCODE_CONFIG_DIR env var
├── uninstall.sh              # Removes it
├── config/                   # OPENCODE_CONFIG_DIR points here
│   ├── opencode.jsonc        # Config fragment
│   ├── ce-instructions.md    # Skill activation sequence
│   ├── commands/             # 18 commands (/ce-test, /ce-plan, etc.)
│   ├── agents/               # 5 agents (@ce-code-reviewer, etc.)
│   ├── skills/               # 25 skills (writing-tests, etc.)
│   └── plugins/              # TypeScript plugins
├── plugins/                  # Original Claude Code plugin (reference only)
├── README.md
├── LICENSE.md
└── MIGRATION.md              # Migration plan from Claude Code plugin
```

## Documentation

- [Extending for Projects](docs/extending-for-projects.md) - How to wrap and extend ce for your specific codebase

## Contributing

Found a bug? Have an idea? Contributions welcome.

1. Fork this repo
2. Create a feature branch
3. Test your changes locally
4. Submit a PR with details

## Resources

- [OpenCode](https://opencode.ai)
- [OpenCode Docs](https://opencode.ai/docs)

## License

MIT - Use it, share it, make it better.
