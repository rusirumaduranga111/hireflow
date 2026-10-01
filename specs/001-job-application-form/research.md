# Research: Job Application Form

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-01

None of the Technical Context items were left as NEEDS CLARIFICATION. This file records the
decisions behind them. Tool versions were checked against the npm registry on 2026-10-01.

## R1. Rendering: browser-only, no SSR (pinned)

- **Decision**: Client-side rendering only. Create the app with `--ssr=false`. Do not add
  `@angular/ssr`, prerendering or hydration.
- **Rationale**: Persistence uses `localStorage`, which exists only in the browser. With SSR or
  prerendering, every storage access would need platform guards, and the confirmation page
  (which is built from stored data) would render empty on the server. Pinning browser-only keeps
  `StorageService` simple and correct.
- **Load-bearing**: If SSR is ever added, R6 and the `StorageService` contract MUST be revisited
  first. Any SSR/prerender change to this feature is a plan amendment, not a refactor.
- **Alternatives considered**: SSR with `isPlatformBrowser` guards, rejected because it adds
  complexity for no user benefit on a single-page form. Prerendering `/apply`, rejected because
  the gain on one route is negligible and it reintroduces server-side storage access.

## R2. Framework and tooling versions

- **Decision**:
  - Angular **22.2** (`@angular/core` 22.2.x, `@angular/cli` 22.2.x) and TypeScript at the version
    the CLI installs;
  - Node 24 LTS and npm 11;
  - zoneless change detection (the CLI default for new apps);
  - `ng test` with the CLI's default **Vitest** runner;
  - `angular-eslint` 22.x and Prettier 3.x, with `eslint-config-prettier` so the two do not clash.
- **Rationale**: These are the current stable releases, and every one is a CLI default, so there
  is no custom build setup. Zoneless fits signal-based OnPush components.
- **Alternatives considered**: Karma/Jasmine, rejected because it is deprecated in the CLI.
  Jest via a builder, rejected because it is a non-default builder for no benefit.

## R3. Form state: signals and pure validation functions

- **Decision**: The smart page component (`ApplyPage`) holds the form as signals:
  - field values: one `signal` per field;
  - `attempted`: whether the candidate has tried to send yet;
  - `status`: `'editing' | 'submitting' | 'failed'`.

  `errors` is a `computed` that runs pure validation functions (`validateApplication(draft)`), and
  only while `attempted` is true. The validators live in a plain TypeScript module so they can be
  unit-tested without Angular. Presentational components get values and errors through `input()`
  and report changes through `output()`.
- **Rationale**:
  - The spec's rule ("no errors before the first attempt, then live revalidation") is exactly
    `computed(() => attempted() ? validate(draft()) : {})`. Nothing is duplicated, and the
    validators are the core logic the constitution requires unit tests for.
  - Typed models cover the whole draft.
  - The design's own logic (`Design/Job Application Page.dc.html`, `validate` and `tried`) works
    the same way, so behaviour matches the design.
- **Alternatives considered**:
  - Typed Reactive Forms: observable-based, so it mixes paradigms. Its touched/dirty model does not
    match the "after first attempt" rule without extra state.
  - Signal Forms (`@angular/forms/signals`): attractive, but its API is newer than our standards
    and would make the validation rules depend on it. Revisit when it is the documented default.

## R4. Routes and how the confirmation is reached

- **Decision**: `''` redirects to `apply`. Both routes are lazy-loaded with `loadComponent`:
  - `apply`: `ApplyPage`.
  - `confirmation`: `ConfirmationPage`, protected by a functional `hasApplicationGuard`. With no
    saved application, it redirects to `/apply`.

  Unknown paths (`**`) redirect to `apply`. After a successful save, `ApplyPage` navigates to
  `/confirmation` with `replaceUrl: true`, so Back does not return to a half-sent form. The
  confirmation reads the most recent application from `ApplicationService`, not from router
  state, so it survives a reload. "Start again" navigates to `/apply`, which always opens in the
  default state.
- **Rationale**: These are the routes given in the plan input. Reading from storage rather than
  navigation state is what makes the reload requirement (US4, FR-021) work. The spec was updated in
  its Clarifications section to match this routing.
- **Alternatives considered**: Passing the application in `router.navigate` state, rejected because
  it is lost on reload. A `:id` route parameter, rejected because it is not needed for a single
  "latest" confirmation and exposes ids in URLs for no benefit.

## R5. Data shape: matched to the form

- **Decision**: The plan input proposed `{ id, jobTitle, fullName, email, phone, coverNote,
  submittedAt }`. Matched to the actual form, it becomes:
  - **remove `phone`**: there is no phone field on the page or in the spec;
  - **add `linkedInUrl`** (`string | null`, from spec Revision 1);
  - **add `cv`** (`{ fileName, sizeBytes }`, from Clarification Q1);
  - **add `roleId` and `company`**: the confirmation must name the role and company (FR-015), and
    a stored record should describe itself without the role constant.

  Full definition: [data-model.md](./data-model.md).
- **Alternatives considered**: Keeping `phone` as an optional field, rejected because it would
  store data the form never collects, and the constitution's real-content rule says not to invent
  fields.

## R6. Persistence: `localStorage` "applications" array behind two services

- **Decision**:
  - **`StorageService`** (`core/`, `providedIn: 'root'`): the only code that touches
    `localStorage`. It reads and writes JSON by key. It turns any `localStorage` exception (quota,
    blocked storage) and any JSON parse failure into a typed `StorageError`.
  - **`ApplicationService`** (feature, `providedIn: 'root'`): owns the `applications` key. It
    builds the `JobApplication` record (id, trimming, timestamp), appends it to the array and
    writes it back. It exposes the latest application as a signal.

  Contract: [contracts/services.md](./contracts/services.md). Storage format:
  [contracts/storage-schema.md](./contracts/storage-schema.md).
- **Corrupt or unreadable data**: if the stored `applications` value cannot be parsed or fails the
  shape check, `submit` MUST fail (the user sees the submit-failure state). It MUST NOT overwrite
  the stored value. The confirmation guard treats it as "no application". This prevents silent
  loss of earlier applications.
- **IDs**: `crypto.randomUUID()`. It is available on `localhost` and HTTPS, which covers every
  supported way of running the app.
- **Alternatives considered**: IndexedDB, rejected because it is async-only and needs more code
  for a few small records. `sessionStorage`, rejected because it does not survive a browser
  restart (FR-020).

## R7. Making the submitting state visible, and reproducing failures

- **Decision**:
  - `ApplicationService.submit` is `async` and waits a short, injectable latency before saving
    (`SUBMIT_LATENCY_MS`, default 600 ms in the app, 0 in unit tests).
  - In dev mode only (`isDevMode()`), opening `/apply?simulateFailure=once` makes the **next**
    save attempt reject with a `StorageError`, so the failure-then-retry flow can be checked by
    hand.
- **Rationale**:
  - `localStorage` writes are synchronous. Without a delay, the submitting state (FR-013,
    SC-006) would last less than a frame and could never be seen or checked.
  - An async contract also matches a future server API.
  - "Once" lets the retry succeed on the same URL, which is what US3 #3 checks.
- **Alternatives considered**: A random failure rate, rejected because it is not deterministic for
  verification. Filling storage quota by hand, which still works as a "real" failure check but is
  awkward as the main method.

## R8. Design tokens: mapping the Visual Language to CSS custom properties

- **Decision**:
  - `frontend/src/styles/tokens.css` defines every design value once on `:root`, as `--hf-*`
    custom properties.
  - The source is `Design/HireFlow Style Sheet.dc.html` (page title "Visual language"; the plan
    input's "HireFlow Visual Language.dc" refers to this file). Page layout comes from
    `Design/Job Application Page.dc.html`. Block order and breakpoints come from
    `Design/Job Application Wireframes.dc.html` (variant **1a** on mobile, **2b** with a sticky
    facts column at 900px and above, which matches what the page implements).

  Full map: [contracts/design-tokens.md](./contracts/design-tokens.md).
- **Values in the page but not the style sheet** (each one is checked in the Constitution Check):

  | Page value | Use | Decision |
  |---|---|---|
  | 40px title at ≥900px; 1.7 reading line-height | Page title, description paragraphs | **Keep** as page-level tokens (`--hf-font-size-display`, `--hf-line-height-reading`). They are intentional responsive and reading choices in the design. |
  | 40px, 56px, 80px spacing | Main padding, column gap | **Keep** as layout tokens. They are multiples of 8, so they stay on the grid. |
  | 15px text | Brand name, fact values | **Snap to 16px** (Body). 15 is not in the type scale. |
  | 20px spacing | Facts list gap; mobile card padding "20/16" | **Snap to the grid**: facts gap 24px; mobile card padding 16px. 20px breaks the 8px-grid rule in `Design/CLAUDE.md`. |
  | 420px breakpoint (page) vs 480px (style sheet: title steps down "below 480px") | Compact gutter, title and card padding | **Use 420px**: the page is the more specific design and the mobile frames were checked against it. |

- **Breakpoints**: CSS custom properties cannot be used inside `@media` conditions. So the two
  breakpoints (420px and 900px) are the only literal values allowed outside `tokens.css`. They are
  documented in the tokens contract (see the plan's Complexity Tracking).
- **Enforcement**: a quickstart check searches component styles for hex, `rgb(`, `px` and `em`
  literals outside `tokens.css`. Zero matches is required (quality gate 1).
- **Alternatives considered**: Stylelint with `declaration-strict-value`, which is stronger but
  adds another tool and config for a workshop. It can be added later without changing tokens.
  Sass variables, rejected because they are compile-time only, while the constitution requires CSS
  custom properties.

## R9. Accessibility details the design leaves open

- **Decision**:
  - **CV picker**: the design's clickable `<div>` drop zone becomes a real `<button>` ("Choose a
    file") linked to a visually hidden `<input type="file" accept=".pdf,.doc,.docx">`. The drop
    target wraps it. The file type and 10MB limit are checked in code (FR-004), not only through
    `accept`.
  - **Errors**: each field error has an id, referenced from the control's `aria-describedby`, and
    an invalid control gets `aria-invalid="true"`. The validation summary and the failure alert use
    `role="alert"`. After a blocked send, focus moves to the summary (`tabindex="-1"`).
  - **Submitting**: the button keeps its primary styling, shows "Sending…", and gets
    `aria-disabled="true"`, with a polite live region announcing the change. Fields are set
    `readonly` (the CV picker is disabled), so a value cannot change mid-save.
  - **Confirmation**: on arrival, focus moves to the "Application sent" heading.
  - **Focus**: buttons use the style sheet's 2px offset ring. Inputs use the inset border plus 3px
    halo (`--hf-focus-ring`, `--hf-focus-halo`).
- **Rationale**: Principle III and FR-024/FR-025. Every pattern reuses the style sheet's existing
  focus and error styles, so the design does not change.

## R10. File naming against the Angular 22 style guide

- **Decision**: Follow the Angular v20+ style guide, which the CLI generates by default:
  - Components, directives and guards have no type suffix: `application-form.ts` →
    `ApplicationForm`, `has-application-guard.ts` → `hasApplicationGuard`.
  - **Services** are the one exception. They keep the `.service.ts` / `…Service` naming
    (`application.service.ts` → `ApplicationService`). Set
    `"@schematics/angular:service": { "type": "service" }` in `angular.json`, so `ng g s` produces
    this.
  - Models are interfaces with no suffix (`job-application.ts` → `JobApplication`).
  - The selector prefix is `hf` (`"prefix": "hf"` in `angular.json`).
- **Rationale**: The project standards name `ApplicationService` and `StorageService` explicitly.
  Without the suffix, the service would collide with the `JobApplication` model in readers' minds.
  Everything else follows the CLI default, so `ng generate` output needs no renaming.
