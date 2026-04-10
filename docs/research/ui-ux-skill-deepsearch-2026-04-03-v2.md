## UI/UX Deepsearch Refresh

Date: 2026-04-03

### Primary sources reviewed

- shadcn/ui
  - https://github.com/shadcn-ui/ui
  - Why it matters: production-grade accessible component patterns, clean composition, strong default hierarchy.

- Magic UI
  - https://github.com/magicuidesign/magicui
  - Why it matters: motion and visual drama for design engineers, useful for premium hero/detail accents when applied with restraint.

- Origin UI
  - https://github.com/kubalinio/originui-react
  - Why it matters: broad, modern app UI patterns with shadcn-style conventions and cleaner production-ready composition than generic AI landing pages.

- Launch UI
  - https://github.com/launch-ui/launch-ui
  - Why it matters: strong marketing/landing page composition, clean section sequencing, modern SaaS-grade content hierarchy.

- React Spectrum / React Aria
  - https://github.com/adobe/react-spectrum
  - Why it matters: accessibility, interaction quality, keyboard semantics, state completeness, adaptive component behavior.

- OpenUI Design System
  - https://github.com/openui/design-system
  - Why it matters: global, accessible, themeable component model and stronger design-system thinking.

- Design Tokens Community Group
  - https://github.com/design-tokens/community-group
  - Why it matters: tokenized spacing, color roles, typography, elevation, and scalable theming contracts.

- WCAG
  - https://github.com/w3c/wcag
  - Why it matters: contrast, semantics, keyboard, focus, content clarity, and robust accessibility constraints.

### Practical conclusions for AURA injection

1. Force hierarchy before decoration
- AI must start from page narrative, CTA priority, and section order before gradients, cards, or animation.

2. Token-first design
- Require explicit spacing, radius, typography, color-role, and elevation tokens.
- Ban arbitrary spacing and random color pairings.

3. One clear architecture
- For normal React/Vite work, prefer one app root.
- Do not create `frontend/`, `backend/`, `api/`, and root `src/` together unless explicitly asked.

4. Minimal dependency discipline
- Prefer built-in CSS, semantic HTML, and React structure first.
- Add dependencies only when they materially improve accessibility, routing, or maintainability.

5. State completeness
- Every serious UI output should think about hover, focus, empty, loading, error, disabled, and image-fallback states.

6. Real-world visual quality
- Avoid empty hero blocks, washed-out contrast, and copy-paste “hero + 3 cards + footer” sludge.
- Prefer asymmetry, visual anchors, section rhythm, and deliberate typography.

7. Mobile-first verification
- Output should remain readable and visually coherent on narrow screens without relying on luck.

### Injection updates recommended

- Strengthen `Aura UI/UX Pro Max` with:
  - section narrative rules
  - token-first system
  - interaction-state completeness
  - contrast/fallback constraints
  - anti-generic landing-page rules

- Strengthen `Frontend UI` preset with:
  - professional design-engineer instruction
  - dependency minimization
  - single-app architecture default
  - stronger preferred design models

- Strengthen workspace output contract with:
  - single-root app bias
  - explicit dependency discipline
  - no duplicate package manifests without user approval
