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

HireFlow is a recruitment platform. There is **no application code yet**: no build system, no package manifest, no tests. So far the repo holds:

- `Design/`: static HTML design mockups and the brand/design rules.
- `.specify/` + `.claude/skills/speckit-*`: GitHub Spec Kit (v0.16.0) scaffolding for spec-driven development.

Once a stack is chosen (through `/speckit-plan`), add build, lint, and test commands here.

## Spec-driven workflow (Spec Kit)

Features are built in this order through the skills: `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` (optional) → `/speckit-implement`. `/speckit-converge` appends unbuilt work to `tasks.md`. `/speckit-checklist` and `/speckit-taskstoissues` are helpers.

- Helper scripts are **PowerShell** (`.specify/scripts/powershell/*.ps1`). The integration is configured with `"script": "ps"`, so run them with PowerShell, not bash.
- Feature numbering is sequential. Each feature gets its own directory under `specs/`. The active feature comes from `SPECIFY_FEATURE` / `SPECIFY_FEATURE_DIRECTORY` or `.specify/feature.json`.
- Templates for spec, plan, tasks, checklist, and constitution are in `.specify/templates/`.
- `.specify/memory/constitution.md` is still the **unfilled template**. Run `/speckit-constitution` before planning so that the plan's constitution checks mean something.

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
