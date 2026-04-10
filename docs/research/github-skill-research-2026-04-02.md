# GitHub Research: Coding Skill and UI/UX Skill for AURA IDE

Date: 2026-04-02

## Goal

Find robust GitHub-based references to strengthen the skill injection layer inside AURA IDE, especially for:

- coding skill
- UI/UX skill
- review/security skill
- developer workflow orchestration

The target is not to copy one repository blindly, but to extract the strongest patterns and inject them into:

- `AURA_COLLECTIVE`
- `DEVELOPER_TASK_PRESETS`
- future `AI Settings` / skill profiles
- `AI Activity` workflow behavior

## Best Sources

### 1. Coding Skill Foundation

#### `github/awesome-copilot`

Why it matters:

- strongest public repository for AI coding customization patterns
- has the exact structure AURA needs conceptually: agents, instructions, skills, hooks, workflows, plugins
- suitable as the main reference for how to organize AURA skill packs

What to borrow into AURA:

- layered customization model:
  - global instructions
  - task-specific prompts
  - agent personas
  - reusable skills
  - workflow hooks
- project-aware instruction files
- task collections instead of one giant system prompt

Use inside AURA:

- make each AURA skill a structured bundle, not only a single sentence instruction
- split skill injection into:
  - global engineering rules
  - task preset rules
  - provider/model-specific optimization hints
  - file/domain-specific rules

### 2. Cursor-Style Rule Patterns

#### `PatrickJS/awesome-cursorrules`
#### `tugkanboz/awesome-cursorrules`

Why they matter:

- best community reference for editor-native AI rules
- useful for how teams write practical coding behaviors for an agentic IDE
- good source for concise, enforceable, path-aware instructions

What to borrow into AURA:

- short rule blocks instead of long essay prompts
- clear “always do / never do / verify before finish” structure
- frontend-specific and backend-specific rule sets
- repository-aware behavior

Use inside AURA:

- add internal rule packs such as:
  - `frontend-react.rules`
  - `backend-api.rules`
  - `security-review.rules`
  - `bugfix-rca.rules`
  - `tauri-runtime.rules`

### 3. Backend and Architecture Robustness

#### `Sairyss/backend-best-practices`

Why it matters:

- one of the strongest backend engineering best-practices references on GitHub
- useful for real maintainability, contracts, layering, validation, and architecture thinking

What to borrow into AURA:

- domain separation
- validation-first API thinking
- contracts and boundaries
- error handling and observability expectations
- architecture quality checks before implementation

Use inside AURA:

- strengthen `Aura Architect`
- strengthen `Backend API` and `Fullstack` presets
- inject checklists for:
  - input validation
  - service boundary design
  - domain separation
  - error handling
  - testability

### 4. Security and Review Skill

#### `softwaresecured/secure-code-review-checklist`
#### `mgreiler/secure-code-review-checklist`

Why they matter:

- simple, practical, robust review checklists
- directly applicable to review mode and PR-style analysis

What to borrow into AURA:

- structured review domains:
  - authentication
  - authorization
  - input validation
  - secure storage
  - output encoding
  - logging
  - secrets
- risk-first review output

Use inside AURA:

- improve `Aura Security`
- improve `Code Review` preset
- force review output to prioritize:
  - critical risks
  - regressions
  - missing tests
  - security hardening

## Best Sources for UI/UX Skill

### 5. Practical UI Component Quality

#### `shadcn-ui/ui`

Why it matters:

- strongest practical GitHub reference for modern, accessible, production-ready React UI patterns
- very useful for implementation realism, not only visual ideas

What to borrow into AURA:

- composable component thinking
- accessible defaults
- clean layout hierarchy
- implementation-ready UI quality
- “open code” mindset instead of locked design system

Use inside AURA:

- strengthen `Aura UI/UX Pro Max`
- strengthen `Frontend UI` preset
- inject rules for:
  - accessibility baseline
  - component composition
  - spacing consistency
  - state handling for UI controls
  - empty/loading/error states

### 6. Semantic and Accessible Design System Thinking

#### `openui/design-system`

Why it matters:

- useful for framework-agnostic UI semantics and accessible component behavior
- helps AURA avoid “pretty but shallow” UI prompts

What to borrow into AURA:

- component semantics
- accessibility behavior
- reusable UI patterns
- consistency across frameworks

Use inside AURA:

- inject design reasoning that checks:
  - semantics
  - control affordance
  - accessibility
  - interaction consistency

### 7. Design Token Standardization

#### `design-tokens/community-group`

Why it matters:

- strongest public standard reference for design token structure
- useful if AURA wants UI/UX skill to generate scalable systems, not one-off styling

What to borrow into AURA:

- token naming discipline
- theme structure
- spacing/color/typography tokenization

Use inside AURA:

- add a token-first instruction mode for UI generation
- when building larger interfaces, prefer:
  - CSS variables
  - reusable tokens
  - semantic color names
  - spacing scales

### 8. Accessibility Baseline

#### `w3c/wcag`

Why it matters:

- canonical accessibility reference
- strongest baseline for UI skill quality control

What to borrow into AURA:

- readable contrast
- keyboard navigation
- semantic HTML
- focus states
- label and form clarity

Use inside AURA:

- add accessibility enforcement to `Frontend UI`
- add a lightweight accessibility review pass for generated UI

## Recommended Injection Strategy for AURA

### A. Do not treat skills as one-line personas

Current AURA skill objects are useful but too thin.

Recommended next structure per skill:

- identity
- goal
- constraints
- workflow
- output contract
- verification checklist
- anti-patterns

Example:

- `Aura Architect`
  - architecture checklist
  - API contract checklist
  - refactor safety checklist
- `Aura UI/UX Pro Max`
  - layout checklist
  - responsive checklist
  - accessibility checklist
  - design-token checklist
- `Aura Debugger`
  - RCA workflow
  - reproduction checklist
  - verification checklist

### B. Split AURA instructions into 4 layers

#### Layer 1: Global Engineering Core

Always injected:

- maintainability
- minimal safe change
- verify before done
- explain assumptions
- prefer production-ready structure

#### Layer 2: Skill Pack

Based on selected agent:

- Architect
- Debugger
- UI/UX Pro Max
- Security
- Orchestrator

#### Layer 3: Task Pack

Based on developer preset:

- Fullstack
- Frontend UI
- Backend API
- Automation
- Bugfix
- Code Review
- Refactor

#### Layer 4: Workspace Context

Dynamic:

- current files
- active file
- open tabs
- framework
- package manager
- detected stack

## Recommended Skill Packs to Add Next

### Coding-Oriented

- `Aura Fullstack Engineer`
  - best source blend:
    - awesome-copilot
    - backend-best-practices
    - existing architect skill
- `Aura Frontend Engineer`
  - best source blend:
    - shadcn/ui
    - openui/design-system
    - wcag
- `Aura Backend Engineer`
  - best source blend:
    - backend-best-practices
    - secure review checklist
- `Aura Refactor Engineer`
  - best source blend:
    - awesome-cursorrules patterns
    - architecture checklist
- `Aura Reviewer`
  - best source blend:
    - secure-code-review-checklist
    - existing security persona

### UI/UX-Oriented

- `Aura Design System Engineer`
  - design tokens
  - semantic components
  - scalable UI architecture
- `Aura Accessibility Reviewer`
  - WCAG-based checks
  - keyboard/focus/form/contrast review
- `Aura Interaction Designer`
  - layout
  - responsiveness
  - empty/loading/error states
  - motion discipline

## Best Immediate Recommendation

If only 2 skills are upgraded first, prioritize:

### 1. `Aura Coding Core`

Blend:

- `github/awesome-copilot`
- `awesome-cursorrules`
- `Sairyss/backend-best-practices`
- secure review checklist

Role:

- fullstack
- automation
- backend
- refactor
- bugfix

### 2. `Aura UI/UX Core`

Blend:

- `shadcn-ui/ui`
- `openui/design-system`
- `design-tokens/community-group`
- `w3c/wcag`

Role:

- frontend UI
- responsive layouts
- design system output
- accessibility-aware implementation

## Concrete Next Implementation Inside AURA

### Phase 1

- create richer instruction payloads in `src/utils/constants.ts`
- replace one-line skill instructions with structured rule blocks
- add a dedicated accessibility subsection for `Frontend UI`
- add a dedicated security checklist for `Code Review`

### Phase 2

- add internal skill presets:
  - `coding-core`
  - `uiux-core`
  - `backend-core`
  - `review-core`
- map each developer task preset to one primary skill pack + one safety pack

### Phase 3

- show injected skill pack summary inside `AI Settings`
- show which checklist is active in `AI Activity`
- let AURA annotate generated drafts with:
  - architecture
  - UI/UX
  - accessibility
  - security

## Recommendation Summary

Most robust GitHub-backed sources for AURA:

- coding framework:
  - `github/awesome-copilot`
  - `awesome-cursorrules`
  - `Sairyss/backend-best-practices`
  - `secure-code-review-checklist`
- UI/UX framework:
  - `shadcn-ui/ui`
  - `openui/design-system`
  - `design-tokens/community-group`
  - `w3c/wcag`

Best product decision:

- use these repos as reference layers
- do not mirror them directly
- convert them into compact, enforceable skill packs inside AURA
- inject them by task, not globally all at once
