## Terminal Shell Benchmark - 2026-04-04

Goal: simplify AURA's terminal toward the calmer shell pattern users expect from Cursor/Trae/VS Code style IDEs.

Sources checked:

- Cursor product page
  - https://cursor.com/product/
- Trae product/download pages
  - https://traeide.com/
  - https://traeide.com/download
- VS Code terminal expectations used as practical reference pattern
  - minimal tabs
  - one integrated output area
  - shell prompt inline at the bottom
  - no floating command composer inside terminal output

Practical benchmark conclusions applied to AURA:

1. The integrated terminal should feel like one surface, not stacked widgets.
2. Terminal output must occupy the available panel height without fixed-height math that can overlap the prompt.
3. Keep only the essential chrome: `Terminal`, `Problems`, `Stop`, and `Clear`.
4. The shell prompt should be inline and familiar, e.g. `PS C:\path\...>`.
5. Avoid duplicate terminal tabs, duplicate toolbars, and floating input boxes.
6. Problems should be a separate tab, not mixed into terminal output by default.

Implementation note:

Official Cursor and Trae pages do not publish a detailed integrated-terminal component specification. The benchmark is therefore based on their overall IDE positioning plus established editor UX norms rather than a claimed line-by-line parity with undocumented internals.
