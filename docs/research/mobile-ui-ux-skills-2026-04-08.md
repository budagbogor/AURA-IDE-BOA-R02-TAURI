# Mobile UI/UX Skills Notes

Date: 2026-04-08

Sources:
- https://github.com/awesome-skills/mobile-app-design
- https://github.com/google-labs-code/stitch-skills

What was useful:
- `mobile-app-design` provides mobile UI/UX standards around platform conventions, touch targets, typography, contrast, accessibility, perceived performance, loading/error states, and component architecture.
- `stitch-skills` provides a useful workflow for turning vague UI prompts into explicit design intent: atmosphere, palette roles, geometry, depth/elevation, layout principles, prompt enhancement, and modular React component conversion.

AURA integration decision:
- Do not install these skills into generated apps by default.
- Do not change AURA's default mobile stack to Expo or React Native.
- Apply the skills as prompt and quality-gate intelligence for AURA's Capacitor + React mobile mode.

Applied guidance:
- Mobile prompts now require a touch-first product journey, screen hierarchy, and navigation model.
- Mobile UI must account for iOS/Android-like conventions, 44-48px touch targets, readable typography, accessible contrast, and non-color-only status indicators.
- Generated screens should include tap feedback, loading states, disabled states, empty/error/offline states, and recovery copy.
- Repeated mobile content should be decoupled into `src/data/*` when useful.
- Mobile UI should include a compact semantic design system: atmosphere, palette roles, typography scale, spacing rhythm, radii, elevation, focus states, pressed states, and icon style.
- Stitch-style prompt enhancement is adapted conceptually: AURA should internally clarify product archetype, user intent, density, palette role, and component inventory before generating files.

