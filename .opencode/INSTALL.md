# Installing CE for OpenCode

## Prerequisites

- [OpenCode](https://opencode.ai) installed and working

## Installation

Add the ce plugin to your `opencode.json`:

```json
{
  "plugin": [
    "claude-essentials@git+https://github.com/Broderick-Westrope/claude-essentials.git"
  ]
}
```

Start an OpenCode session. On first run, the plugin will:

1. Register all 32 skills for discovery
2. Inject skill activation instructions into the system prompt
3. Symlink commands and agents into your project's `.opencode/` directory

## What You Get

| Component | Count | Access Pattern | Example |
|-----------|-------|---------------|---------|
| Skills | 32 | `skill({ name: "ce:writing-tests" })` | Load testing patterns |
| Commands | 19 | `/ce-test`, `/ce-plan`, `/ce-commit` | Run tests, create plans |
| Agents | 5 | `@ce-code-reviewer`, `@ce-haiku` | Code review, task delegation |

## Verification

After starting a session:

1. Ask OpenCode to list available skills — you should see 32 `ce:` prefixed skills
2. Try `/ce-test` to run tests
3. Try `@ce-code-reviewer` to review code

## Auto-Symlink Behavior

Commands and agents are automatically symlinked into your project on session start:

```
your-project/
└── .opencode/
    ├── commands/
    │   ├── ce-test.md → <plugin-path>/.opencode/commands/ce-test.md
    │   ├── ce-plan.md → <plugin-path>/.opencode/commands/ce-plan.md
    │   └── ...
    └── agents/
        ├── ce-code-reviewer.md → <plugin-path>/.opencode/agents/ce-code-reviewer.md
        └── ...
```

- Symlinks are created only if the target doesn't already exist
- Your own files with the same name take precedence (symlinks won't overwrite)
- Directories are created automatically if needed

## Troubleshooting

**Skills not showing up:**
- Check that `opencode.json` has the plugin entry
- Restart the OpenCode session
- Verify the plugin installed: check for `node_modules/claude-essentials/` or equivalent

**Commands not available:**
- Check `.opencode/commands/` in your project for symlinked `ce-*.md` files
- If missing, the session hook may not have run — restart the session
- Verify the symlinks point to valid files: `ls -la .opencode/commands/`

**Agents not found:**
- Same as commands — check `.opencode/agents/` for symlinked files
- Agents require `@ce-` prefix (e.g., `@ce-code-reviewer`, not `@code-reviewer`)

**Plugin not loading:**
- Ensure `package.json` in the plugin root has `"type": "module"` and `"main": ".opencode/plugins/ce.js"`
- Check for JS errors: the plugin uses ES modules, so Node.js 18+ is required
