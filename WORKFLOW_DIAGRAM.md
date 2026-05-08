# Claude Essentials: Workflow Diagrams

## Complete Workflow: Idea to Completion

```mermaid
graph TD
    A["💡 Idea/Problem"] --> B{Clear Direction?}
    B -->|No, explore| C["/ce:brainstorm"]
    B -->|Yes, understand| D["/ce:grill"]
    
    C --> E["Ask clarifying questions<br/>Propose 2-3 approaches<br/>Present design sections"]
    D --> F["Explore codebase<br/>Ask targeted questions<br/>Suggest alternatives"]
    
    E --> G["Write spec to disk<br/>plans/design-YYYY-MM-DD-*.md"]
    F --> G
    
    G --> H["@ce:devils-advocate<br/>Design Review"]
    H -->|Issues found| I["Fix and re-dispatch<br/>Max 3 iterations"]
    I --> H
    H -->|Approved| J["User reviews spec"]
    J -->|Changes| G
    J -->|Approved| K["ce:writing-plans<br/>Create Implementation Plan"]
    
    K --> L["Write plan to disk<br/>plans/impl-YYYY-MM-DD-*.md"]
    L --> M["@ce:devils-advocate<br/>Plan Review"]
    M -->|Issues| N["Fix and re-dispatch"]
    N --> M
    M -->|Approved| O["Present to user"]
    
    O --> P["/ce:execute"]
    P --> Q["Setup<br/>Create branch/worktree<br/>Track progress"]
    
    Q --> R["Group tasks by subsystem<br/>Identify dependencies<br/>Plan parallelization"]
    
    R --> S["Dispatch subagents<br/>Groups run in parallel<br/>Auto-recovery from errors"]
    
    S --> T["Verify<br/>✓ Spec compliance<br/>✓ Automated tests<br/>✓ Manual verification<br/>✓ DX quality<br/>✓ Code review"]
    
    T -->|Issues| U["Fix and re-verify"]
    U --> T
    
    T -->|All pass| V["Commit<br/>Stage by name<br/>Semantic message"]
    
    V --> W["Cleanup<br/>Merge branch<br/>Remove worktree<br/>Mark COMPLETED"]
    
    W --> X["✅ Done!"]
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style D fill:#fff3e0
    style H fill:#ffebee
    style M fill:#ffebee
    style S fill:#e8f5e9
    style T fill:#f3e5f5
    style X fill:#c8e6c9
```

## Brainstorming Workflow

```mermaid
graph TD
    A["Explore project context<br/>Read files, docs, commits"]
    B["Ask clarifying questions<br/>One at a time"]
    C["Propose 2-3 approaches<br/>With trade-offs"]
    D["Present design sections<br/>Get approval after each"]
    E["Write spec to disk<br/>plans/design-YYYY-MM-DD-*.md"]
    F["@ce:devils-advocate<br/>Design Review"]
    G["User reviews spec"]
    H["ce:writing-plans<br/>Create plan"]
    
    A --> B
    B --> C
    C --> D
    D -->|Approved| E
    D -->|Revise| D
    E --> F
    F -->|Issues| F
    F -->|Approved| G
    G -->|Changes| E
    G -->|Approved| H
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#e3f2fd
    style E fill:#fff9c4
    style F fill:#ffebee
    style G fill:#f3e5f5
    style H fill:#c8e6c9
```

## Grilling Workflow

```mermaid
graph TD
    A["Explore project context<br/>Read files, docs, commits<br/>Answer questions from code"]
    B["Ask targeted questions<br/>One at a time<br/>Provide recommended answer"]
    C["Suggest alternatives<br/>Deepen understanding"]
    D["Shared understanding<br/>reached?"]
    E["Write spec to disk<br/>plans/design-YYYY-MM-DD-*.md"]
    F["@ce:devils-advocate<br/>Design Review"]
    G["User reviews spec"]
    H["ce:writing-plans<br/>Create plan"]
    
    A --> B
    B --> C
    C --> D
    D -->|No| B
    D -->|Yes| E
    E --> F
    F -->|Issues| F
    F -->|Approved| G
    G -->|Changes| E
    G -->|Approved| H
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#fff9c4
    style E fill:#fff9c4
    style F fill:#ffebee
    style G fill:#f3e5f5
    style H fill:#c8e6c9
```

## Planning Workflow

```mermaid
graph TD
    A["Input: Spec file or<br/>feature description"]
    B{Spec file<br/>provided?}
    C["Read spec file<br/>Use directly"]
    D["Clarify ambiguity<br/>with user"]
    E["Create implementation plan<br/>Group tasks by subsystem"]
    F["@ce:devils-advocate<br/>Plan Review"]
    G["Incorporate feedback"]
    H["Present plan to user"]
    
    A --> B
    B -->|Yes| C
    B -->|No| D
    C --> E
    D --> E
    E --> F
    F -->|Issues| G
    G --> F
    F -->|Approved| H
    
    style A fill:#e3f2fd
    style C fill:#fff9c4
    style D fill:#fff9c4
    style E fill:#e8f5e9
    style F fill:#ffebee
    style G fill:#fff9c4
    style H fill:#f3e5f5
```

## Execution Workflow

```mermaid
graph TD
    A["Setup<br/>Create branch/worktree<br/>Clarify ambiguity<br/>Track progress"]
    B["Group tasks by subsystem<br/>Identify dependencies<br/>Plan parallelization"]
    C["Dispatch subagents<br/>Group A: src/auth/*<br/>Group B: src/billing/*<br/>Group C: Integration"]
    D["Monitor execution<br/>Handle status reports<br/>Auto-recovery"]
    E["Verify<br/>Spec compliance<br/>Automated tests<br/>Manual verification<br/>DX quality<br/>Code review"]
    F["Commit<br/>Stage by name<br/>Semantic message"]
    G["Cleanup<br/>Merge branch<br/>Remove worktree<br/>Mark COMPLETED"]
    
    A --> B
    B --> C
    C -->|Group A| C1["Subagent 1<br/>Task 1, Task 2"]
    C -->|Group B| C2["Subagent 2<br/>Task 3, Task 4"]
    C -->|Group C| C3["Subagent 3<br/>Task 5"]
    
    C1 --> D
    C2 --> D
    C3 --> D
    
    D -->|Issues| D1["Fix and re-dispatch"]
    D1 --> D
    D -->|All done| E
    
    E -->|Issues| E1["Fix and re-verify"]
    E1 --> E
    E -->|All pass| F
    
    F --> G
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e8f5e9
    style C1 fill:#c8e6c9
    style C2 fill:#c8e6c9
    style C3 fill:#c8e6c9
    style D fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#fff9c4
    style G fill:#fff9c4
```

## Task Grouping & Parallelization

```mermaid
graph TD
    A["Plan with tasks"]
    
    A --> B["## Authentication Tasks"]
    B --> B1["Task 1: Add login"]
    B --> B2["Task 2: Add logout"]
    
    A --> C["## Billing Tasks"]
    C --> C1["Task 3: Add billing API"]
    C --> C2["Task 4: Add webhooks"]
    
    A --> D["## Integration Tasks"]
    D --> D1["Task 5: Wire auth + billing"]
    
    B1 --> E["Group A: Subagent 1<br/>Sequential execution<br/>Shared context"]
    B2 --> E
    
    C1 --> F["Group B: Subagent 2<br/>Sequential execution<br/>Shared context"]
    C2 --> F
    
    D1 --> G["Group C: Subagent 3<br/>Depends on A + B"]
    
    E -->|Parallel| F
    E -->|Parallel| F
    
    F -->|Sequential| G
    E -->|Sequential| G
    
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#e3f2fd
    style E fill:#c8e6c9
    style F fill:#c8e6c9
    style G fill:#fff9c4
```

## Code Review Dimensions

```mermaid
graph TD
    A["@ce:code-reviewer-opus + @ce:code-reviewer-sonnet<br/>Dual-Model PR Review"]
    
    A --> B["Correctness"]
    B --> B1["Logic errors"]
    B --> B2["Bugs & edge cases"]
    B --> B3["Error handling"]
    
    A --> C["Security"]
    C --> C1["Vulnerabilities"]
    C --> C2["Input validation"]
    C --> C3["Sensitive data"]
    
    A --> D["Performance"]
    D --> D1["Algorithmic complexity"]
    D --> D2["Memory leaks"]
    D --> D3["Unnecessary re-renders"]
    
    A --> E["Maintainability"]
    E --> E1["Code clarity"]
    E --> E2["Naming"]
    E --> E3["Structure"]
    
    A --> F["Conventions"]
    F --> F1["Pattern alignment"]
    F --> F2["Deviations"]
    
    A --> G["Architecture"]
    G --> G1["Separation of concerns"]
    G --> G2["API design"]
    G --> G3["Module boundaries"]
    
    A --> H["Product & UX"]
    H --> H1["User flow completeness"]
    H --> H2["Edge cases"]
    H --> H3["Accessibility"]
    
    A --> I["Developer Experience"]
    I --> I1["API intuitiveness"]
    I --> I2["Error messages"]
    I --> I3["Extension points"]
    
    A --> J["Documentation"]
    J --> J1["README updates"]
    J --> J2["API docs"]
    J --> J3["Code comments"]
    
    style A fill:#ffebee
    style B fill:#ffcdd2
    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style G fill:#ffcdd2
    style H fill:#ffcdd2
    style I fill:#ffcdd2
    style J fill:#ffcdd2
```

## Skill Activation Sequence

```mermaid
graph TD
    A["Skill-based workflow<br/>e.g., /ce:test, /ce:debug"]
    
    B["Step 1: EVALUATE<br/>For each available skill:<br/>state YES/NO + reason"]
    
    C["Step 2: ACTIVATE<br/>Call Skill() tool<br/>for each relevant skill<br/>NOW"]
    
    D["Step 3: IMPLEMENT<br/>Only after Step 2<br/>proceed with implementation"]
    
    A --> B
    B --> C
    C --> D
    
    E["❌ WRONG<br/>Skip to implementation<br/>without activating skills"]
    
    B -.->|CRITICAL| E
    
    style A fill:#e3f2fd
    style B fill:#fff9c4
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#ffcdd2
```

## Verification Checklist

```mermaid
graph TD
    A["Verification<br/>All 5 checks must pass"]
    
    A --> B["✓ Spec Compliance<br/>Does implementation<br/>match plan?"]
    
    A --> C["✓ Automated Tests<br/>Full test suite<br/>passes"]
    
    A --> D["✓ Manual Verification<br/>Actually use<br/>the feature"]
    
    A --> E["✓ DX Quality<br/>No confusing errors<br/>No noisy output<br/>No rough edges"]
    
    A --> F["✓ Code Review<br/>@ce:code-reviewer-opus +<br/>@ce:code-reviewer-sonnet<br/>Mandatory"]
    
    B -->|Pass| G["All checks pass"]
    C -->|Pass| G
    D -->|Pass| G
    E -->|Pass| G
    F -->|Pass| G
    
    B -->|Fail| H["Fix and re-verify"]
    C -->|Fail| H
    D -->|Fail| H
    E -->|Fail| H
    F -->|Fail| H
    
    H --> A
    
    G --> I["✅ Ready to commit"]
    
    style A fill:#f3e5f5
    style B fill:#e1bee7
    style C fill:#e1bee7
    style D fill:#e1bee7
    style E fill:#e1bee7
    style F fill:#e1bee7
    style G fill:#c8e6c9
    style H fill:#fff9c4
    style I fill:#c8e6c9
```

## Agent Roles

```mermaid
graph TD
    A["AI Agents"]
    
    A --> B["@ce:code-reviewer-opus"]
    B --> B1["Deep, nuanced PR reviews"]
    B --> B2["Technical, product, DX"]
    B --> B3["Mandatory in execution"]
    
    A --> B4["@ce:code-reviewer-sonnet"]
    B4 --> B5["Fast, broad PR reviews"]
    B4 --> B6["Technical, product, DX"]
    B4 --> B7["Runs in parallel with Opus"]
    
    A --> C["@ce:devils-advocate"]
    C --> C1["Rigorous critique"]
    C --> C2["Find real flaws"]
    C --> C3["Review plans & specs"]
    
    A --> D["@ce:haiku"]
    D --> D1["Lightweight agent"]
    D --> D2["Simple delegated tasks"]
    
    A --> E["@ce:log-reader"]
    E --> E1["Log analysis"]
    E --> E2["Targeted search"]
    
    A --> F["@ce:context-auditor"]
    F --> F1["Documentation gaps"]
    F --> F2["Knowledge audit"]
    
    style A fill:#e8eaf6
    style B fill:#c5cae9
    style C fill:#c5cae9
    style D fill:#c5cae9
    style E fill:#c5cae9
    style F fill:#c5cae9
```

## File Organization

```
project/
├── plans/
│   ├── design-YYYY-MM-DD-feature1.md      # Design spec
│   ├── impl-YYYY-MM-DD-feature1.md        # Implementation plan
│   ├── design-YYYY-MM-DD-feature2.md
│   ├── impl-YYYY-MM-DD-feature2.md
│   └── done/                              # Completed plans
│       └── impl-YYYY-MM-DD-feature1.md
│
├── .claude/
│   ├── CLAUDE.md                          # Project instructions
│   ├── settings.json                      # Permissions
│   └── rules/
│       ├── testing.md
│       ├── error-handling.md
│       └── {stack}/
│
└── src/
    ├── feature1/
    ├── feature2/
    └── ...
```

## Plugin Architecture

```mermaid
graph TD
    A["Claude Essentials Plugin"]
    
    A --> B["Shared Skills<br/>plugins/ce/skills/"]
    B --> B1["ce:writing-plans"]
    B --> B2["ce:executing-plans"]
    B --> B3["ce:writing-tests"]
    B --> B4["... 29 more"]
    
    A --> C["Claude Code<br/>plugins/ce/"]
    C --> C1["Commands<br/>19 × /ce:*"]
    C --> C2["Agents<br/>5 × @ce:*"]
    C --> C3["Hooks<br/>SessionStart, Notification"]
    
    A --> D["OpenCode<br/>opencode/"]
    D --> D1["Commands<br/>19 × /ce-*"]
    D --> D2["Agents<br/>5 × @ce-*"]
    D --> D3["JS Adapter<br/>ce.js"]
    
    style A fill:#e0e0e0
    style B fill:#fff9c4
    style C fill:#c8e6c9
    style D fill:#b3e5fc
```

## Typical Workflows

### New Feature (Complete Cycle)

```
/ce:brainstorm "Add real-time notifications"
    ↓
plans/design-YYYY-MM-DD-notifications.md
    ↓
@ce:devils-advocate (design review)
    ↓
User reviews spec
    ↓
/ce:plan plans/design-YYYY-MM-DD-notifications.md
    ↓
plans/impl-YYYY-MM-DD-notifications.md
    ↓
@ce:devils-advocate (plan review)
    ↓
/ce:execute plans/impl-YYYY-MM-DD-notifications.md
    ↓
Subagents execute task groups in parallel
    ↓
Verify (tests, manual, DX, code review)
    ↓
Commit & merge
    ↓
✅ Done!
```

### Bug Fix (Quick Cycle)

```
/ce:debug
    ↓
Systematic debugging (understand, reproduce, isolate, fix)
    ↓
/ce:test
    ↓
Run tests, analyze failures
    ↓
/ce:commit
    ↓
Preflight checks, semantic commit
    ↓
✅ Done!
```

### Code Review Before Merge

```
/ce:review
    ↓
Tracked findings as checklist
    ↓
Fix issues
    ↓
/ce:commit
    ↓
✅ Ready to merge!
```
