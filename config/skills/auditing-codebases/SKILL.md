---
name: auditing-codebases
description: Audit an entire codebase for bugs, security holes, error handling gaps, testing gaps, dead code, and other concrete problems. Use when a user wants you to scan, review, or sweep a whole project to find what's broken, dangerous, or fixable — not a single file or known bug, but a broad investigation across the entire repo. Produces a prioritized list of specific findings with file paths, each actionable as a pull request. This is the right skill whenever the user's intent is "find everything wrong with this codebase" regardless of how they phrase it. Do NOT use for debugging a specific bug, refactoring specific code, writing docs, explaining code, performance profiling, or CI/CD setup.
---

# Auditing Codebases

**Core principle:** Every finding must be something that can be fixed in a pull request. If it can't be expressed as a concrete code change, it's not a finding - it's an opinion.

This skill is designed to run without human input. It does not ask questions, request clarification, or suggest new features. It examines the code as it exists and identifies problems that exist right now.

## What's In Scope vs Out of Scope

| In scope | Out of scope |
|----------|-------------|
| Bugs and correctness issues | New feature suggestions |
| Error handling gaps | Architecture redesigns |
| Security vulnerabilities | "You should consider adding X" |
| Dead code and unused dependencies | Subjective style preferences |
| Missing or broken tests | Feature roadmap items |
| Performance problems in existing code | Build system overhauls |
| Stale TODOs/FIXMEs that indicate known broken things | Documentation authoring |
| Inconsistencies that cause real confusion or bugs | Cosmetic nitpicks |

The test is: "Could an automated system open a PR to fix this, and would merging that PR make the code objectively better?" If yes, it's a finding. If it requires product decisions, user research, or design input, it's out of scope.

## The Audit Process

### Phase 1: Orient

Understand the project before looking for problems. This runs automatically - no user input needed.

1. **Read project config** - `go.mod`, `package.json`, `Cargo.toml`, `pyproject.toml`, etc. Identify the language, framework, dependencies, and their versions.
2. **Map the structure** - Understand the top-level directory layout, module boundaries, and entry points.
3. **Check quality tooling** - Look for linter configs, formatter configs, CI workflows, test setups. Note what exists and what's missing.
4. **Gauge project maturity** - Look at commit history, test coverage, dependency age, and code organization to calibrate severity thresholds. A side project and a production service get different standards.

### Phase 2: Investigate

Work through each dimension. Spend more time where Phase 1 suggested weaknesses. Use subagents for parallel investigation across dimensions when available.

| Dimension | What to look for | PR-able? |
|-----------|-----------------|----------|
| **Bugs & correctness** | Unhandled errors, nil/null dereferences, race conditions, off-by-one errors, logic errors, incorrect assumptions about data shapes | Yes - direct fix |
| **Error handling** | Silent swallows (empty catch/ignored return errors), missing context in error messages, panics where errors should be returned, inconsistent strategies across similar code paths | Yes - add handling |
| **Security** | Hardcoded secrets, injection vulnerabilities, improper input validation, overly permissive permissions, deps with known CVEs | Yes - fix or upgrade |
| **Testing gaps** | Critical paths with no test coverage, tests that assert on mocks instead of behavior, tests that can't fail, broken or skipped tests | Yes - add/fix tests |
| **Dead code** | Unused functions, unreachable branches, commented-out code, unused dependencies, unexported types/functions that nothing references | Yes - remove it |
| **Code quality** | Duplicated logic (3+ instances of the same pattern), overly complex functions (high cyclomatic complexity), misleading names that make the wrong thing look right | Yes - refactor |
| **Performance** | N+1 queries, unbounded allocations, unnecessary work in hot paths, missing resource cleanup (unclosed handles, leaked goroutines) | Yes - fix the code |
| **Dependency health** | Deps with known vulnerabilities, deps that are abandoned/archived, deps pinned to very old versions with available upgrades | Yes - upgrade or replace |
| **Stale annotations** | TODO/FIXME/HACK/XXX comments, especially ones describing bugs or workarounds that are still present | Yes - fix or remove |

**Where to focus reading:**
- Entry points and public APIs (highest leverage)
- Error paths (where bugs concentrate)
- The most complex modules (where architectural issues hide)
- Test directories (their structure reveals coverage gaps)

### Phase 3: Classify

Categorize each finding by how urgent and impactful it is.

| Severity | Criteria |
|----------|----------|
| **Critical** | Data loss, security vulnerability, crash/panic in normal usage, correctness bug that produces wrong results |
| **High** | Significant code quality issue that affects maintainability or reliability, important missing test coverage, resource leaks |
| **Medium** | Real issue but contained blast radius, tech debt that slows development, inconsistencies that could eventually cause bugs |
| **Low** | Dead code removal, stale comments, minor inefficiency in non-hot paths |

### Phase 4: Trim

The report is consumed by another AI that will implement fixes as PRs. A concise, high-signal report is far more useful than an exhaustive one. Noise in the form of low-value findings wastes context and dilutes focus.

Apply this trimming logic after classifying all findings:

1. Start from the top: include all Critical findings, then High, then Medium, then Low.
2. Once you have **5 or more findings** from the higher-severity tiers, **stop**. Drop remaining lower-severity findings entirely.
3. If you don't reach 5 from the higher tiers alone, keep including the next tier down until you hit 5 or run out of findings.
4. If the total across all tiers is under 5, include everything.

The goal: give the downstream system enough choice to pick impactful work, without burying it in noise. A report with 3 critical and 3 high findings doesn't need 8 medium and 12 low findings tagged on.

### Phase 5: Report

Produce a structured report. Every finding must include a file path and be specific enough that an automated system could write a PR from it.

**Formatting rules:**
- Do not include code blocks or code snippets. The consumer is an LLM that can read the source files directly given a file path and line number. Prose descriptions are sufficient.
- Do not assign ticket-like IDs to findings (no "C-1", "H-3", "L-5"). Just use descriptive titles.
- Keep each finding brief: 1-2 sentences per field. The Location/Issue/Impact/Fix structure is the right level of detail.

## Output Format

```markdown
## Codebase Audit: [Project Name]

### Summary
[2-3 sentences: overall health assessment. Be direct.]

### Findings

#### Critical

**[Short descriptive title]**
- **Location:** `file/path.go:123`
- **Issue:** [1-2 sentences: what's wrong, stated concretely]
- **Impact:** [What breaks or goes wrong because of this]
- **Fix:** [Specific change needed, described in plain language - e.g., "replace the hardcoded ModeMarathon with the mode variable that was already resolved on line 30"]

#### High
[Same format]

#### Medium
[Same format, only if included after trimming]

#### Low
[Same format, only if included after trimming]
```

Omit severity sections that have no findings or were trimmed. If the codebase is in good shape and there are no meaningful findings, say so clearly and produce an empty findings section rather than inventing problems.

## Calibration

**Only report real problems.** The bar for a finding is: "this is objectively wrong, broken, missing, or dangerous." Not "I would have done this differently." If a function uses a for-loop where a map would be more idiomatic, that's not a finding. If a function silently ignores an error that could cause data corruption, that is.

**Consolidate patterns.** If the same problem appears 20 times (e.g., ignored errors across an HTTP handler layer), report it once as a systemic finding with 2-3 representative locations. Don't list all 20 - the fix is the same pattern applied everywhere.

**Be specific about locations.** Every finding needs a file path and ideally a line number. "Error handling is inconsistent" is not a finding. "`internal/server/handler.go:84` ignores the error from `json.NewDecoder().Decode()`, which means malformed request bodies are silently treated as empty" is a finding.

**No feature suggestions.** "This project should add rate limiting" is not a finding - it's a feature request. "The existing rate limiter at `pkg/middleware/ratelimit.go:45` doesn't account for the case where `redis.Get` returns an error, falling through to allow all requests" is a finding.

**Keep it brief.** The consumer is an AI, not a human skimming a PDF. It doesn't need code blocks - it can read the source files itself given a path and line number. Prose descriptions of what's wrong and how to fix it are sufficient and much more compact. Don't pad with examples, context, or lengthy explanations.

**Scale to the project.** A 500-line CLI tool might have 0-3 findings. A 50,000-line application might have 10-15. Don't pad the report to look thorough. Fewer, high-quality findings are more useful than a long list of marginal ones.
