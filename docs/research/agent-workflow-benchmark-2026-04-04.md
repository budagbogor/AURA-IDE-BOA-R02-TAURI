## Agent Workflow Benchmark - 2026-04-04

Official references checked:

- Anthropic Claude Code overview/settings
  - https://docs.anthropic.com/en/docs/claude-code/overview
  - https://docs.anthropic.com/en/docs/claude-code/settings
- Cursor rules documentation
  - https://docs.cursor.com/context/rules
- Trae documentation and `.rules` positioning
  - https://traeide.com/docs

What matters most for AURA:

1. Project-scoped instructions are a first-class capability, not a chat habit.
2. Rules should be version-controlled with the project and auto-applied when relevant.
3. Agent behavior should depend on current file, domain, and request, not only one global preset.
4. Generic terminal commands should be routed to the real app package when the workspace is nested.
5. The IDE should reduce ambiguity: one main app target, one predictable verification path.

Applied to AURA:

- Added project rules ingestion from:
  - `AGENTS.md`
  - `.cursorrules`
  - `.cursor/rules/*`
  - `.rules/*`
  - `.aura/rules/*`
  - `.claude/agents/*`
- Added command rewrite so `npm run dev/build/install/lint` can target the primary app package automatically when the real app lives in `frontend/` or `client/`.
