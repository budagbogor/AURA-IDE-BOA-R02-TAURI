# UI/UX Skill Deepsearch - 2026-04-04

Sources used to harden AURA's design skill injection:

- shadcn/ui changelog and skills/blocks direction
  - https://ui.shadcn.com/docs/changelog
- nextlevelbuilder ui-ux-pro-max skill registry
  - https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill
- skills.homes mirror / metadata
  - https://skills.homes/en/skills/nextlevelbuilder-ui-ux-pro-max-skill-codex-skills-ui-ux-pro-max-skill-md
- React Spectrum official design system guidance
  - https://react-spectrum.adobe.com/v3/index.html
- Open UI analyzed design systems
  - https://open-ui.org/design-systems/
- WCAG accessibility guidance
  - https://www.w3.org/WAI/
- Awesome Cursor Rules
  - https://github.com/PatrickJS/awesome-cursorrules
- Awesome Copilot
  - https://github.com/github/awesome-copilot

Distilled design rules for AURA:

1. Prefer one calm visual system over decorative noise.
2. Start from hierarchy, navigation, CTA flow, and content rhythm before styling.
3. Use explicit tokens for spacing, typography, radii, borders, shadows, and colors.
4. Treat accessibility, contrast, and focus states as first-class requirements.
5. Avoid generic centered hero plus random cards unless the prompt truly calls for it.
6. Use dependencies sparingly; composition and structure matter more than extra UI packages.
7. Ensure image-free and content-variable fallbacks still look intentional.
8. Make mobile density and readable desktop rhythm part of the first pass, not polish at the end.
9. Force the model to choose a style direction, palette, and typography strategy instead of mixing everything.
10. Evaluate CSS structure quality, not only page appearance.
11. In AURA's frontend pipeline, Tailwind CSS v4 should be the default implementation layer unless the user explicitly requests another styling system.

Additional patterns adopted from nextlevelbuilder/ui-ux-pro-max-skill and adjacent skill registries:

12. Force a silent pre-code design choice: product archetype, style direction, palette strategy, typography mood, and layout density.
13. Treat touch targets, mobile readability, async/loading space reservation, and fallback states as critical gates, not nice-to-have polish.
14. Prefer one coherent component rhythm over improvising each section with unrelated visual ideas.
15. Keep motion, z-index, and decorative effects restrained unless they support hierarchy or usability.
