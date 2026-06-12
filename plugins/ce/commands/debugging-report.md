---
description: Write a structured debugging report for an investigation
argument-hint: "<topic-or-slug>"
allowed-tools: Task, Skill
---

Use the **debugging-report** skill to produce a structured investigation report. If a debugging session is in progress, also use the **systematic-debugging** skill for the investigation itself.

Arguments:

- `$ARGUMENTS`: Short slug or topic for the report filename

1. Gather all investigation context from the current session
2. Write the report following the exact template in the skill
3. Verify structural integrity of the output file
