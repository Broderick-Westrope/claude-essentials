# Claude Essentials Instructions

These instructions are loaded additively alongside your AGENTS.md and project-level instructions.

## Skill Activation Sequence

When working on any task, follow this mandatory sequence before implementation:

### Step 1 - EVALUATE

For each available skill (use the `skill` tool to list them), assess relevance:
- State: `[skill-name] - YES/NO - [reason]`

### Step 2 - ACTIVATE

- If any skills are YES: Use `Skill(<skill-name>)` for EACH relevant skill NOW
- If no skills are YES: State "No skills needed" and proceed

### Step 3 - IMPLEMENT

Only after Step 2 is complete, proceed with implementation.

**CRITICAL:** You MUST call `Skill()` in Step 2. Do NOT skip to implementation. The evaluation (Step 1) is worthless unless you ACTIVATE (Step 2) the skills.

**Example of correct sequence:**
- `writing-tests`: YES - matches current task
- `handling-errors`: NO - not relevant
- `systematic-debugging`: NO - not relevant

Then IMMEDIATELY use `Skill(writing-tests)` before starting implementation.

## Project Tooling Detection

When committing or verifying work, detect project tooling on demand:
- Check for `package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`, `tsconfig.json`
- Check for linter/formatter configs (eslint, prettier, ruff, mypy, black, etc.)
- Use the `preflight-checks` skill to run detected tools before claiming work is complete

## General Guidelines

- Always verify your work before claiming completion (use `verification-before-completion` skill)
- Reference specific `file:line` when discussing code
- Follow existing patterns and conventions in the project
- Use skills for guidance on specific tasks rather than reinventing approaches
