# CLAUDE.md — Development Workflow

## Purpose
Defines how Claude Code should execute LocalNote development tasks.

## Workflow
1. Always start a **new branch** before implementing new features.
2. For each milestone, run the **plan → implement → review → metrics** cycle.
3. Commit small, frequent changes; prefer atomic commits.
4. Test crypto, editor, and Git functions in isolation.
5. No external APIs or telemetry.

## Style
- TypeScript strict mode
- Functional components (React)
- shadcn/ui for all UI patterns
- Tailwind for styling; use design tokens for spacing/colors
- Prefer async/await over promises

## Testing
- Unit tests: crypto, Git, data schema
- E2E: note creation → encrypt → commit → decrypt
- Run `pnpm test` before every push

## Deployment
- `pnpm dev` for local Chrome testing
- `pnpm build && pnpm start` for production
- Deploy locally only; no cloud hosting

## Branch policy
| Branch | Purpose |
|--------|----------|
| main | stable releases |
| dev | active feature integration |
| feature/* | per-component |
