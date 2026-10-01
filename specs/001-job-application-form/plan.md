# Implementation Plan: Job Application Form

**Branch**: `001-job-application-form` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-job-application-form/spec.md`

This plan follows the constitution (v1.1.0) and `CLAUDE.md`, and does not repeat their standards.
It records only the decisions specific to this feature.

## Summary

Rebuild `Design/Job Application Page.dc.html` as a browser-only Angular 22 app in `frontend/`.
There are two lazy-loaded routes:

- `/apply`: the role page and application form, covering the default, validating, submitting and
  submit-failure states.
- `/confirmation`: the success state. It is built from the latest saved application, so it
  survives a reload.

Form state is held in signals and checked by pure, unit-tested validators. Sent applications are
appended to an `applications` array in `localStorage`, through `ApplicationService` and
`StorageService`. All styling uses `--hf-*` tokens mapped from the Visual Language style sheet.

## Technical Context

**Language/Version**: TypeScript (version pinned by Angular CLI 22.2), Angular 22.2, Node 24 LTS / npm 11

**Primary Dependencies**:
- `@angular/core`, `@angular/router` (zoneless, standalone);
- dev only: `angular-eslint` 22.x, `prettier` 3.x, `eslint-config-prettier`;
- no UI library and no state library.

**Storage**: `localStorage`, key `applications` (JSON array). Browser-only.

**Testing**: `ng test` with the CLI's Vitest runner, for unit tests of validators, form-state
transitions, `StorageService` and `ApplicationService`. Under the constitution's workshop
exception there is no UI or E2E automation. Acceptance is checked by hand using
[quickstart.md](./quickstart.md).

**Target Platform**: Evergreen desktop and mobile browsers. **No SSR, no prerender, no hydration**
(pinned, research R1).

**Project Type**: Single-page web front end (no back end)

**Performance Goals**: The form responds immediately to input and validation. The submitting state
is shown for about 600ms (deliberate, research R7). The candidate can finish in under 2 minutes
(SC-001).

**Constraints**:
- `localStorage` must be available (if it is not, the submit-failure state shows);
- works down to 360px width;
- WCAG AA;
- no hard-coded design values outside `tokens.css`.

**Scale/Scope**: 1 role, 2 routes, about 10 components, and a few stored records per browser.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / standard | Status | How this plan complies |
|---|---|---|
| I. Design fidelity via tokens | ✅, with documented additions | [contracts/design-tokens.md](./contracts/design-tokens.md) maps every value from the style sheet. Page-only values are kept as named tokens or snapped to the grid (research R8). Departures from the design are listed in the spec's "Design deviations". Hard-coded values are checked in quickstart. |
| II. Every designed state ships | ✅ | The five states are mapped in [data-model.md](./data-model.md) and specified in [contracts/routes-and-states.md](./contracts/routes-and-states.md). Submitting is visible because of R7, and submit failure can be reproduced on demand. |
| III. Accessible, mobile-first, restrained | ✅ | The design's `<div>` drop zone becomes a button-based picker (R9). Errors are linked with `aria-describedby`, there are live regions, and focus is managed. The only shared UI is button, text input and card; feature-only parts stay in the feature folder. No gradients or shadows; focus rings are not shadows. |
| IV. Standalone, signal-based Angular | ✅ | Signals and `computed` errors (R3), signal `input()`/`output()`, OnPush, built-in control flow, zoneless. No `any`. |
| V. Acceptance criteria are DoD | ✅, with the workshop exception | Core logic is unit-tested ([contracts/services.md](./contracts/services.md)). Every acceptance criterion maps to a manual check in quickstart, with results recorded in `checklists/acceptance.md`. |
| VI. Real content only | ✅ | Role copy comes word for word from the design. New copy is in the spec. Sample data is realistic and made up. |
| Engineering standards: structure, naming, data access, tooling | ✅ | `frontend/`, feature-first layout, lazy routes, `hf` prefix, Angular 22 naming (R10), all storage through services, ESLint and Prettier. |
| Brand standing instruction | ✅ | Conflicts were flagged and resolved: CV upload vs design (Clarification Q1); confirmation email line (Q2); 15px and 20px values off the scale (R8). |

**Post-design re-check (after Phase 1)**: still passing. The design did not add any new shared
component, any library, or any direct storage access. The extra items are listed under Complexity
Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-job-application-form/
├── plan.md                    # This file
├── research.md                # Phase 0: decisions R1–R10
├── data-model.md              # Phase 1: types, validation rules, state machine
├── quickstart.md              # Phase 1: run commands and manual acceptance checks
├── contracts/
│   ├── services.md            # StorageService, ApplicationService, pure functions
│   ├── storage-schema.md      # localStorage "applications" format
│   ├── routes-and-states.md   # routes, page composition, per-state rendering
│   └── design-tokens.md       # --hf-* token map
├── checklists/
│   └── requirements.md        # spec quality checklist (acceptance.md is added during implement)
└── tasks.md                   # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
frontend/                                   # ng new frontend --ssr=false --style=css --routing --prefix=hf
├── angular.json                            # prefix "hf"; service schematic type "service" (R10)
├── eslint.config.js · .prettierrc · package.json (start/test/lint/format:check scripts)
└── src/
    ├── index.html · main.ts
    ├── styles.css                          # imports tokens + base only
    ├── styles/
    │   ├── tokens.css                      # every --hf-* value (only file with design literals)
    │   └── base.css                        # reset, body font and canvas, link colours
    └── app/
        ├── app.ts · app.config.ts · app.routes.ts   # shell: header, <router-outlet>, footer
        ├── core/
        │   ├── layout/site-header.ts · site-footer.ts
        │   └── storage/storage.service.ts (+ .spec.ts) · storage-error.ts
        ├── shared/ui/
        │   ├── button/button.ts            # hf-button: primary | secondary | quiet; sm | md | lg; also styles links
        │   ├── text-input/text-input.ts    # hf-text-input: label, hint/error slot, single or multiline, counter
        │   └── card/card.ts                # hf-card: default | emphasis (primary border)
        └── features/job-application/
            ├── job-application.routes.ts   # apply, confirmation (lazy loadComponent)
            ├── models/                     # job-role.ts · application-draft.ts · cv-file.ts ·
            │                               # job-application.ts · application-errors.ts · form-state.ts
            ├── data/senior-dotnet-engineer.ts
            ├── validation/                 # application-validation.ts · form-transitions.ts (+ .spec.ts)
            ├── services/                   # application.service.ts (+ .spec.ts) · application.tokens.ts
            ├── guards/has-application-guard.ts
            ├── pages/
            │   ├── apply-page/apply-page.ts                # smart: draft signals, send/retry, navigation
            │   └── confirmation-page/confirmation-page.ts  # smart: reads ApplicationService.latest
            └── components/                 # presentational
                ├── role-header/ · role-facts/ · role-description/
                ├── application-form/ · cv-picker/ · form-alert/
                └── confirmation-card/
```

**Structure Decision**: One Angular app in `frontend/` (there is no back end, so it is not a
front-end/back-end split). It is organised feature-first under
`features/job-application/`. Shared UI is limited to the three constitution components. App-wide
singletons (storage, shell layout) go in `core/`. Each component keeps its template and styles in
sibling `.html` and `.css` files.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| Page-level tokens not in the style sheet: 40px display title, 1.7 reading line-height, 40/56/80px layout spacing, 1.5px drop-zone border, 1040/280px layout widths | Faithful rebuild of `Job Application Page.dc` (Principle I) | Snapping these to the scale visibly changes the designed layout. They are all on the 8px grid or are intentional type choices. |
| Literal breakpoints (420px, 900px) in component `@media` queries | CSS cannot use custom properties in media conditions | Container queries or JS breakpoints add complexity. The values are documented in the tokens contract. |
| Artificial 600ms submit latency (injectable) | Makes the required submitting state visible (Principle II) | A synchronous save makes the state impossible to see or verify. |
| Dev-only `?simulateFailure=once` | Makes the required submit-failure state checkable by hand | Filling storage quota by hand is unreliable for repeated checks. |
| Snapping 15px and 20px design values to the scale | They break the type scale and the 8px grid in `Design/CLAUDE.md` | Keeping them would break the brand rules. The visual difference is 1–4px. |
