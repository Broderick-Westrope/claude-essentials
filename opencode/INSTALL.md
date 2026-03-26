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

Start an OpenCode session. The plugin registers all skills, commands, and agents automatically via the config hook.

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

## Troubleshooting

**Skills not showing up:**
- Check that `opencode.json` has the plugin entry
- Restart the OpenCode session
- Verify the plugin installed: check for `node_modules/claude-essentials/` or equivalent

**Commands or agents not available:**
- The plugin registers these via the config hook — no symlinks needed
- Restart the session to re-run plugin initialization
- Check OpenCode logs for plugin loading errors

**Plugin not loading:**
- Ensure `package.json` in the plugin root has `"type": "module"` and `"main": "opencode/plugins/ce.js"`
- Check for JS errors: the plugin uses ES modules

## Development

After changing command or agent markdown files, regenerate the manifest:

```bash
node scripts/build-manifest.js
```
