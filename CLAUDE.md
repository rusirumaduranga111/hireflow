# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HireFlow — project context

**Product:** HireFlow, a recruitment platform.

## Brand
- Primary blue: `#1D4ED8`
- Neutrals: greys
- Typeface: Inter
- Spacing: 8px grid
- Tone of voice: warm and professional, not corporate-stiff

## Rules (apply to every design in this project)
1. WCAG AA contrast at all times.
2. Mobile-first, works down to 360px wide.
3. Reuse a small set of simple components: button, text input, card.
4. No gradients. No heavy drop-shadows.

## Standing instruction
Flag any later request that conflicts with the above before building it.


## Project state

The repo holds:

- `frontend/`: the Angular 22 app. It is browser-only (no SSR; `localStorage` persistence depends on that), zoneless and standalone. The first feature, the Job Application screen, is built (`specs/001-job-application-form/`).
- `Design/`: static HTML design mockups and the brand/design rules.
- `.specify/` + `.claude/skills/speckit-*`: GitHub Spec Kit (v0.16.0) scaffolding for spec-driven development.

### Commands (run from `frontend/`)

```powershell
npm start              # ng serve → http://localhost:4200/apply
npm test               # ng test (Vitest), single run
npx ng test --watch=false --include src/app/path/to/file.spec.ts   # one spec file
npm run lint           # angular-eslint
npm run format:check   # prettier --check . (npm run format to fix)
npm run build          # production build
```

In dev mode, `/apply?simulateFailure=once` makes the next save fail, to exercise the submit-failure state.

### Frontend architecture

- `src/styles/tokens.css` is the **only** file allowed to contain design literals (`--hf-*` custom properties mapped from the style sheet). Components use `var(--hf-*)` only; the 420px and 900px `@media` breakpoints are the one exception. The token map and where each value comes from are in `specs/001-job-application-form/contracts/design-tokens.md`.
- `src/app/core/`: app-wide singletons (`StorageService` is the only code that touches `localStorage`; site header and footer). `src/app/shared/ui/`: the three shared components. `Button` and `Card` are attribute components (`button[hf-button]`, `section[hf-card]`) so the semantic element stays native.
- `src/app/features/<feature>/`: feature-first. It holds models, data, `validation/` (pure functions, unit-tested), services (`ApplicationService` owns the `applications` storage key), a guard, smart `pages/` and presentational `components/`. Routes are lazy (`loadComponent`).
- Naming follows the Angular v20+ style guide (`application-form.ts` → `ApplicationForm`), except that services keep `.service.ts` / `…Service`.
- Testing: unit tests cover validators, form transitions and services only. UI and E2E automation is skipped under the constitution's workshop exception. Acceptance is checked by hand using the feature's `quickstart.md`, and results go in `checklists/acceptance.md`.

## Spec-driven workflow (Spec Kit)

Features are built in this order through the skills: `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` (optional) → `/speckit-implement`. `/speckit-converge` appends unbuilt work to `tasks.md`. `/speckit-checklist` and `/speckit-taskstoissues` are helpers.

- Helper scripts are **PowerShell** (`.specify/scripts/powershell/*.ps1`). The integration is configured with `"script": "ps"`, so run them with PowerShell, not bash.
- Feature numbering is sequential. Each feature gets its own directory under `specs/`. The active feature comes from `SPECIFY_FEATURE` / `SPECIFY_FEATURE_DIRECTORY` or `.specify/feature.json`.
- Templates for spec, plan, tasks, checklist, and constitution are in `.specify/templates/`.
- `.specify/memory/constitution.md` (v1.1.0) governs all features: design fidelity through tokens, every designed state ships, standalone signal-based Angular, acceptance criteria as the definition of done, and real content only. It includes a time-boxed workshop exception that skips UI and E2E automation.

## Design rules (from `Design/CLAUDE.md`, apply to all UI work)

- Brand: primary blue `#1D4ED8` (hover `#1E40AF`), grey/warm neutrals (e.g. bg `#FAF9F7`, text `#1C1A17`, muted `#57534B`, border `#E7E5E0`), Inter typeface, 8px spacing grid.
- Tone: warm and professional, not corporate-stiff.
- WCAG AA contrast at all times.
- Mobile-first, working down to a 360px width.
- Reuse a small set of simple components: button, text input, card.
- No gradients, no heavy drop shadows.
- **Standing instruction:** before building any request that conflicts with these rules, flag the conflict.

## Design mockups

`Design/*.dc.html` files are design-canvas pages. They load `Design/support.js`, a generated React-based runtime (`dc-runtime`; do not edit it), and wrap content in `<x-dc>` with a `<helmet>` for head content. They use inline styles. `ios-frame.jsx` is a copied starter that provides an iOS device frame for the mobile mockups. These pages are the visual reference for screens: Open Roles (job listing), Job Application (desktop + mobile), wireframes, and the style sheet (`HireFlow Style Sheet.dc.html`). Treat them as specs for implementation, not as production code.
