# UI/UX Skill Deepsearch - 2026-04-03

Goal: improve AURA AI IDE's injected UI/UX skill packs so generated interfaces feel modern, intentional, accessible, and implementation-ready rather than generic block layouts.

## Best source categories

### 1. Agent/prompt structure
- `github/awesome-copilot`
  Why it matters: strong instruction/skills packaging patterns for agent behavior, prompt structure, and reusable skills.
- `PatrickJS/awesome-cursorrules`
  Why it matters: large reference bank for project-specific AI constraints and code-generation rules, especially for frontend stacks.

### 2. Modern component and design-engineering patterns
- `shadcn-ui/ui`
  Why it matters: copy-paste, customizable, accessible components with practical composition patterns and open-code philosophy.
- `magicuidesign/magicui`
  Why it matters: modern motion, hero sections, visual effects, animated patterns, and strong design-engineering sensibility.
- `nolly-studio/cult-ui`
  Why it matters: design-engineer oriented components, strong presentation layer patterns, compatible with shadcn-style composition.

### 3. Accessibility and interaction quality
- `adobe/react-spectrum`
  Why it matters: accessible, adaptive, robust interaction behavior; excellent reference for keyboard, screen reader, and component behavior standards.
- `w3c/wcag`
  Why it matters: primary standard source for accessibility requirements and success criteria.

### 4. Systematic UI architecture
- `openui/open-ui`
  Why it matters: component parts, states, behaviors, transitions, and common web control architecture.
- `openui/design-system`
  Why it matters: global, accessible, themeable design-system framing.
- `design-tokens/community-group`
  Why it matters: design tokens as formal primitives for color, spacing, typography, radii, and theming consistency.

## Injection recommendations

### A. Coding UI/UX core
Inject these rules into the `Aura UI/UX Pro Max` skill:
- start from hierarchy, task flow, and conversion goal before styling
- use reusable sections and components, not one-off blocks
- define design tokens first: spacing, radii, color roles, type scale, shadows
- treat states as first-class work: hover, focus, loading, empty, error, disabled
- preserve accessibility and keyboard behavior while polishing visuals
- motion should support clarity and delight, never hide weak structure
- every generated screen should feel intentional on desktop and mobile

### B. Anti-slop constraints
Add explicit bans:
- avoid white text on nearly-white surfaces
- avoid giant empty sections with weak contrast
- avoid generic `hero + cards + footer` with no design identity
- avoid unstructured gradients and low-purpose glow effects
- avoid introducing motion everywhere; prefer a few meaningful transitions
- avoid creating layout without tokenized spacing rhythm

### C. Output contract additions
For UI tasks, require the AI to:
- define a visual direction in one line before code
- create or update token-bearing styles first when needed
- produce semantic layout and accessible labels
- keep images/media optional with graceful fallback states
- ensure browser-ready output with realistic CSS and working asset placeholders

### D. Runtime verification
For UI tasks, verification should prefer:
- `npm install` if dependencies changed
- `npm run build`
- `npm run dev`
- then visual review in browser if dev server is live

## Most useful repos to keep citing in AURA source refs
- https://github.com/github/awesome-copilot
- https://github.com/PatrickJS/awesome-cursorrules
- https://github.com/shadcn-ui/ui
- https://github.com/magicuidesign/magicui
- https://github.com/nolly-studio/cult-ui
- https://github.com/adobe/react-spectrum
- https://github.com/openui/open-ui
- https://github.com/openui/design-system
- https://github.com/design-tokens/community-group
- https://github.com/w3c/wcag

## Final recommendation

For AURA, the best injection stack for modern UI generation is:
- Prompt architecture: `awesome-copilot` + `awesome-cursorrules`
- Visual/component system: `shadcn-ui` + `magicui` + `cult-ui`
- Accessibility/interaction quality: `react-spectrum` + `wcag`
- UI architecture/tokens: `open-ui` + `openui/design-system` + `design-tokens`

This combination balances:
- practical code generation
- strong visual quality
- accessibility
- composability
- design-system consistency
