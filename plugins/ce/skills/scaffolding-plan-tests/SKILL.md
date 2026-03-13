---
name: scaffolding-plan-tests
description: Translates implementation plan tasks into failing test files before coding begins. Use when generating TDD test scaffolds from plans, deriving test cases from success criteria, or creating test contracts for plan execution.
---

# Scaffolding Plan Tests

**Core principle:** Tests are the contract between what the user wants and what the agent builds. Write them before any implementation so the execute phase has an objective definition of "done."

## How It Works

Read a plan's tasks and success criteria, then produce **real test files** that:

- Compile/parse (no syntax errors)
- Fail on run (nothing implemented yet)
- Assert on **behavior and outcomes**, not implementation details

Tests become the verification mechanism during `/ce:execute`. When all scaffolded tests pass, the task is complete.

## Deriving Test Cases

For each task group in the plan, extract testable behavior from these sources (in priority order):

| Source | What to extract |
|--------|----------------|
| **Success criteria** | Each criterion becomes at least one test case |
| **Task steps** | Steps that create, modify, or validate become test cases |
| **Verify commands** | Existing verification hints tell you what to assert |
| **Implicit behavior** | Error cases, edge cases, and boundaries implied by the feature |

### Test case formula

```
Given [precondition from plan context]
When [action described in task step]
Then [outcome from success criteria or verify command]
```

**Aim for 3-7 test cases per task group.** Fewer means you're missing edge cases. More means you're testing implementation details.

## Test Type Selection

Use the Testing Trophy model from `ce:writing-tests`:

| Plan task type | Default test type | Rationale |
|---------------|-------------------|-----------|
| API endpoint / route handler | Integration | Test request-response with real middleware |
| Business logic / service layer | Integration | Test with real dependencies where possible |
| Pure utility / helper function | Unit | No dependencies to integrate with |
| Full user workflow / multi-step | E2E | Validates the complete path |
| Database schema / migration | Integration | Test against real test DB |
| UI component / page | Integration | Render with real context, assert on visible output |

## Stub Strategy

Tests need to reference code that doesn't exist yet. Create **minimal stubs** so tests compile but fail:

```
project/
  src/auth/login.ts       <- stub: exports function signature, throws "not implemented"
  tests/auth/login.test.ts <- scaffold: real test cases that will fail
```

**Stub rules:**

- Export the function/class/type signature only
- Function bodies: `throw new Error("not implemented")` or language equivalent
- Types/interfaces: define the shape based on what tests need
- Import paths must match where the plan says code will live
- Mark stubs clearly: `// STUB: scaffold-tests — replace during implementation`

**Do not stub:**

- External dependencies (use real packages or mocks per `ce:writing-tests`)
- Test utilities or frameworks
- Existing code that the plan builds on

## File Placement

Place test files where the project's existing tests live. Detect the convention:

| Signal | Convention |
|--------|-----------|
| `tests/` or `__tests__/` directory exists | Mirrored structure: `tests/auth/login.test.ts` |
| Test files co-located with source | Same directory: `src/auth/login.test.ts` |
| `*_test.go` files next to source | Go convention: `src/auth/login_test.go` |
| `test_*.py` files in `tests/` | Python convention: `tests/test_login.py` |

If no convention is detectable, ask the user.

## Plan File Updates

After scaffolding, update each task in the plan with a `**Tests:**` line:

```markdown
### Task 1: Add login endpoint

**Context:** `src/auth/`, `tests/auth/`
**Tests:** `tests/auth/login.test.ts`

**Steps:**
1. [ ] Create `src/auth/login.ts` with authentication logic
2. [ ] Wire up route in `src/routes.ts`

**Verify:** `npm test -- tests/auth/`
```

Also add a section at the top of the plan:

```markdown
## Test Contract

> Tests scaffolded on YYYY-MM-DD. All tests must pass for plan completion.

| Task Group | Test File | Cases |
|-----------|-----------|-------|
| Auth tasks | `tests/auth/login.test.ts` | 5 |
| Billing tasks | `tests/billing/charges.test.ts` | 4 |
```

## Interactive Refinement

After generating tests for a task group, present them to the user for review. The goal is to catch misunderstandings **before** implementation, not after.

**Present each group as:**

```
## Auth Tasks — 5 test cases

1. "should authenticate with valid credentials" — POST /login with valid email/password returns 200 + token
2. "should reject invalid password" — POST /login with wrong password returns 401
3. "should reject non-existent user" — POST /login with unknown email returns 401 (same error, no user enumeration)
4. "should rate-limit after 5 failures" — 6th attempt within window returns 429
5. "should require email format" — POST /login with malformed email returns 400

Want to add, remove, or change any test cases?
```

**Refinement triggers:**

- User says a case is wrong: fix it
- User adds a case: add it
- User says "that's not how it works": dig deeper, ask clarifying questions
- User approves: write the test file and move to next group

**Key:** This is where the value lives. The conversation about test cases surfaces misaligned assumptions that would otherwise only appear during code review.

## Quality Checklist

Before finalizing scaffolded tests:

- [ ] Every success criterion has at least one test
- [ ] Happy path and primary error paths covered
- [ ] Tests assert on observable behavior (responses, return values, side effects), not internals
- [ ] Test names describe the behavior being verified in plain language
- [ ] Stubs exist for all imports so tests compile
- [ ] Tests actually fail when run (confirmed, not assumed)
- [ ] Plan file updated with test references and test contract table

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Testing implementation before it's designed | Tests couple to code that doesn't exist | Test behavior and outcomes only |
| Too many test cases per group | Overwhelming for user review, likely testing internals | Cap at 3-7 per group, merge related assertions |
| Stubs that partially implement logic | Tests might pass without real implementation | Stubs must throw/panic/raise, never return real values |
| Skipping user review | Defeats the purpose, tests may not match intent | Always present and get explicit approval |
| Writing tests for infrastructure/config tasks | Not all plan tasks need tests | Skip tasks that are pure config, setup, or wiring |

## Cross-References

- **Test patterns and anti-patterns:** `Skill(ce:writing-tests)`
- **Plan structure and task sizing:** `Skill(ce:writing-plans)`
- **Executing with scaffolded tests:** `Skill(ce:executing-plans)`
