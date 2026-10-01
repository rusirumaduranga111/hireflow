<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0 (MINOR: new section added, Principles IV and V materially expanded)
Modified principles:
  - IV. Standalone Angular, Typed Models → IV. Standalone, Signal-Based Angular (expanded: OnPush,
    signal inputs/outputs/model, signal state, built-in control flow, no `any`, strict TS)
  - V. Acceptance Criteria Are the Definition of Done (expanded: unit tests for core logic and
    services; time-boxed workshop exception for UI/E2E automation)
Added sections:
  - Engineering Standards (project structure, naming, components, state & data, templates &
    reactivity, styling & accessibility, tooling)
Modified sections:
  - Development Workflow & Quality Gates: lint/format gate and Angular-standards review items added
Removed sections: none
Templates reviewed (not modified, per command scope; they read this file at runtime):
  - .specify/templates/plan-template.md: Constitution Check must cover the new Engineering
    Standards section; the project structure must use frontend/
  - .specify/templates/tasks-template.md: under the workshop exception, test tasks are unit tests
    for core logic and services only (no UI/E2E tasks)
Notes:
  - The user input said "./design". The exported design folder in the repo is `Design/`, and this
    constitution refers to that folder.
  - The workshop exception to UI/E2E automation is deliberate and temporary. Remove it (MINOR
    amendment) before any production or client build.
Deferred TODOs: none
-->

# HireFlow Constitution

## Core Principles

### I. Design Fidelity via Tokens

- The exported design in `Design/` is the visual specification. `Design/HireFlow Style Sheet.dc.html`
  ("Visual language") is the single source of truth for colour, typography, spacing, radii,
  borders and component styling.
- Every design value MUST be defined once as a CSS custom property (design token), e.g.
  `--hf-color-primary`, `--hf-space-2`, `--hf-font-size-body`. Token names and values MUST trace
  back to the style sheet.
- Component and page styles MUST consume tokens only. Hard-coded colours, font sizes, spacing,
  radii or shadows in component styles are prohibited. The only allowed literal values are inside
  the token definitions themselves.
- Screens with an exported design (e.g. `Design/Job Application Page.dc.html`) MUST be rebuilt
  faithfully: same layout, hierarchy, copy, spacing and component usage at each breakpoint shown.
  Any intentional deviation MUST be written down in the feature's spec or plan along with the
  reason for it.

Rationale: tokens keep the build and the design in sync from a single source. Hard-coded values
drift without anyone noticing.

### II. Every Designed State Ships

- Every UI state shown in the design MUST be implemented and reachable: at minimum **default**,
  **validating**, **submitting**, **success** and **error**, wherever the design shows them.
- A feature that implements only the happy path is NOT done.
- Every state MUST be specified in the feature spec, covered by acceptance criteria, and listed in
  tasks.
- Error states MUST tell the user what went wrong and how to recover, in the design's tone.

Rationale: in a recruitment flow, the non-happy paths (invalid input, slow submits, failures) are
where candidates drop out. They are part of the product, not polish.

### III. Accessible, Mobile-First, Restrained UI

- All text and interactive elements MUST meet WCAG 2.x AA contrast.
- Markup MUST be semantic HTML. Every form control MUST have an associated label, and every
  interactive element MUST show a visible focus indicator.
- Layouts MUST be built mobile-first and MUST work, without horizontal scrolling, down to 360px
  viewport width.
- UI MUST be composed from a small, shared set of simple components (button, text input, card).
  A new shared component MUST be justified in the plan.
- Gradients and heavy drop shadows are prohibited.

Rationale: candidates apply from phones and from assistive technology. A small, flat component set
keeps the product consistent and accessible.

### IV. Standalone, Signal-Based Angular

- The front end is Angular. All components, directives and pipes MUST be **standalone**. NgModules
  MUST NOT be introduced for feature code.
- Components MUST use `changeDetection: ChangeDetectionStrategy.OnPush`, and MUST use signal-based
  APIs (`input()`, `output()`, `model()`) rather than the `@Input()`/`@Output()` decorators.
- Local state MUST use signals (`signal`, `computed`). Derived values MUST be computed, not stored
  a second time.
- Templates MUST use the built-in control flow (`@if`, `@for` with `track`, `@switch`). Templates
  MUST NOT contain business logic.
- All domain data MUST be described by explicit TypeScript interfaces or types. `any` is
  prohibited. Forms MUST be strongly typed. TypeScript strict mode and Angular strict template
  checking MUST stay enabled.

Rationale: standalone, OnPush and signal-based components are Angular's current, predictable
model. Typed models catch contract errors at compile time instead of in front of candidates.

### V. Acceptance Criteria Are the Definition of Done

- Every user story in a spec MUST have testable acceptance criteria (Given/When/Then or an
  equivalent).
- A feature is done only when every acceptance criterion in its spec passes. This includes the
  criteria for every state required by Principle II.
- Core logic and services (validation rules, state transitions, data access) MUST have unit tests.
- Every acceptance criterion MUST be verified by an automated test or, where automation is not in
  scope, by a documented manual check recorded with the feature.
- **Workshop exception (time-boxed):** for this workshop, UI-level and end-to-end automation tests
  are skipped on purpose to save time. Acceptance criteria that would need them are verified by
  documented manual checks instead. This is NOT the production default: a real client build MUST
  restore UI/E2E automation, and this exception MUST then be removed by amendment.

Rationale: shared, testable criteria stop "done" from meaning "it works on my screen". Unit tests
on core logic give the most confidence for the time available.

### VI. Real Content Only

- Lorem ipsum and other placeholder filler text are prohibited in designs, code, fixtures and demos.
- UI copy MUST come from the design or the spec, written in HireFlow's voice. Where content is
  missing, the spec MUST flag it as an open question rather than invent filler.
- Sample and seed data MUST be realistic (plausible roles, locations, salaries, candidate details)
  and MUST NOT contain real personal data.

Rationale: real content reveals real layout problems (long titles, wrapping, empty fields) that
filler text hides.

## Brand & Design Standards

- Primary colour: blue `#1D4ED8`. Neutrals: greys. Typeface: Inter. Spacing: 8px grid. All of
  these are expressed as tokens per Principle I. Where the style sheet is more specific, it wins.
- Tone of voice: warm and professional, not corporate-stiff. This applies to all UI copy,
  validation messages and error messages.
- Standing instruction: any request that conflicts with this constitution or with
  `Design/CLAUDE.md` MUST be flagged, naming the conflicting rule, before any work on it starts.

## Engineering Standards

These standards follow the official Angular style guide for the Angular version the project uses.
Where this section is more specific than the style guide, this section wins.

**Project structure**

- The Angular application MUST live in `frontend/` at the repo root, separate from the `Design/`
  export and the Spec Kit artifacts (`.specify/`, `specs/`). All `ng` and npm commands MUST be run
  from inside `frontend/`.
- Code is organised feature-first. A feature's components, service(s) and models live together in
  its feature folder. Reusable UI (button, text input, card, and similar) goes in `shared/`.
  App-wide singletons (e.g. storage, HTTP setup, error handling) go in `core/`.
- Feature routes MUST be lazy-loaded (`loadComponent` / `loadChildren`).

**Naming**

- File names are kebab-case. Each file holds one concept, and the file name matches its main
  export (e.g. `application-form.component.ts` → `ApplicationFormComponent`).
- Classes are PascalCase. Models are PascalCase interfaces or types (e.g. `JobApplication`).
- Component selectors MUST use the `hf-` prefix (e.g. `hf-application-form`). Directive selectors
  use the camelCase `hf` prefix.

**Components**

- Components stay small and focused. Separate data-owning ("smart") containers from presentational
  ("dumb") components wherever that improves clarity or reuse. Presentational components get data
  only through inputs and report only through outputs.

**State & data**

- Services MUST be `@Injectable({ providedIn: 'root' })` unless a narrower scope is justified in
  the plan.
- All data access (HTTP, `localStorage`, mocks) MUST go through a service (e.g.
  `ApplicationService`, `StorageService`). Components MUST NOT call storage or HTTP APIs directly.

**Templates & reactivity**

- Prefer signals. Where observables are used, templates MUST consume them with the `async` pipe,
  and manual subscriptions MUST be cleaned up with `takeUntilDestroyed()`.

**Styling**

- Styles MUST be component-scoped. Global styles are limited to the token definitions, a reset and
  base typography.
- All colour, typography and spacing MUST come from CSS custom properties mapped to the design
  tokens (Principle I).

**Tooling**

- ESLint (angular-eslint) and Prettier MUST be configured in `frontend/` and applied consistently.
  Code MUST pass lint and format checks before merge.

## Development Workflow & Quality Gates

- Features follow the Spec Kit flow: specify → (clarify) → plan → tasks → (analyze) → implement.
- The plan's Constitution Check MUST confirm, for each principle and for the Engineering Standards,
  either compliance or a documented, justified exception.
- Before merging, a review MUST confirm that:
  1. no hard-coded design values appear outside the token definitions;
  2. every designed state is implemented and reachable;
  3. AA contrast, labelled controls and visible focus are in place, and the layout works at 360px;
  4. components are standalone, OnPush and signal-based, and models are typed with no `any`;
  5. the structure, naming and data-access rules of the Engineering Standards are followed;
  6. ESLint and Prettier pass, and unit tests for core logic and services pass;
  7. all acceptance criteria pass (automated or documented manual check);
  8. no placeholder content is present.

## Governance

- This constitution supersedes conflicting practices, conventions and ad hoc instructions in this
  repository.
- Amendments are made through `/speckit-constitution`. Each amendment MUST update the Sync Impact
  Report and the version line below.
- Versioning follows semantic versioning:
  - MAJOR: a principle is removed or redefined incompatibly.
  - MINOR: a principle or section is added, or guidance is materially expanded.
  - PATCH: clarifications and wording fixes.
- Compliance is checked at plan time (Constitution Check) and at review time (quality gates
  above). Unjustified violations block the merge.
- Time-boxed exceptions (such as the workshop exception in Principle V) MUST state their scope and
  MUST be removed by amendment when that scope ends.
- Runtime guidance for agents lives in `CLAUDE.md` and `Design/CLAUDE.md`. Where they conflict
  with this constitution, this constitution prevails.

**Version**: 1.1.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
