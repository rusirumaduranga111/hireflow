---

description: "Task list for the Job Application Form feature"
---

# Tasks: Job Application Form

**Input**: Design documents from `specs/001-job-application-form/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: The constitution (Principle V) requires **unit tests for core logic and services**,
and those tasks are included. Under the workshop exception, there are **no UI or E2E automation
tasks**. Acceptance is checked by hand using quickstart.md and recorded in
`checklists/acceptance.md`.

**Organization**: Tasks are grouped by user story so each one can be built and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: The user story the task belongs to (US1 to US4)
- All paths are relative to the repo root. The Angular app lives in `frontend/`, and every `ng` or
  `npm` command runs from inside `frontend/`.

## Conventions every task follows

These are defined in the constitution, plan and research, and are not repeated in each task:

- **Components**: standalone; `ChangeDetectionStrategy.OnPush`; `input()`, `output()` and
  `model()`; built-in control flow; separate `.html` and `.css` files; selectors use the `hf-`
  prefix.
- **Naming**: no `Component` suffix (research R10). Services keep `.service.ts` / `…Service`.
- **Styles**: use only `var(--hf-*)` tokens. Literal values are allowed only in `tokens.css` and
  in `@media (max-width: 420px)` / `@media (min-width: 900px)`.
- **Copy**: comes word for word from `Design/Job Application Page.dc.html` or from the spec, never
  placeholder text. Types are explicit and `any` is never used.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Angular workspace in `frontend/` with tooling configured.

- [ ] T001 From the repo root, run `npx @angular/cli@22.2 new frontend --ssr=false --style=css --routing --prefix=hf --skip-git` to create the Angular 22 workspace in `frontend/`. Confirm `frontend/angular.json` has `"prefix": "hf"` and no `@angular/ssr` or `server` entries (research R1). Delete the CLI's starter template content from `frontend/src/app/app.html`.
- [ ] T002 In `frontend/angular.json`, under `projects.frontend.schematics`, add `"@schematics/angular:component": { "changeDetection": "OnPush", "style": "css" }` and `"@schematics/angular:service": { "type": "service" }` (research R10). Confirm that `strict: true` in `frontend/tsconfig.json` and `strictTemplates: true` in its `angularCompilerOptions` are both set.
- [ ] T003 [P] In `frontend/`, run `npx ng add angular-eslint@22`. Then edit `frontend/eslint.config.js` to: require the `hf` component selector prefix (kebab-case, element) and the `hf` directive prefix (camelCase, attribute); turn on `@angular-eslint/prefer-on-push-component-change-detection`, `@angular-eslint/prefer-signals` and `@typescript-eslint/no-explicit-any: "error"`; and add `eslint-config-prettier` last.
- [ ] T004 [P] In `frontend/`, run `npm i -D prettier@3 eslint-config-prettier`. Create `frontend/.prettierrc` (`{ "singleQuote": true, "printWidth": 100 }` plus an `overrides` entry for `*.html` with `"parser": "angular"`) and `frontend/.prettierignore` (`dist`, `.angular`, `coverage`).
- [ ] T005 In `frontend/package.json`, set the scripts to: `"start": "ng serve"`, `"build": "ng build"`, `"test": "ng test --watch=false"`, `"lint": "ng lint"`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`. Then run `npm test`, `npm run lint` and `npm run format:check` once to confirm the empty workspace passes (depends on T003, T004).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, the shell, shared UI, models, role content, storage and route skeleton. Every
story needs these.

**⚠️ CRITICAL**: No user-story work can start until this phase is complete.

### Design tokens and global styles

- [ ] T006 Create `frontend/src/styles/tokens.css` with a single `:root` block that defines every token in `specs/001-job-application-form/contracts/design-tokens.md`, with exactly the names and values listed there (colour, focus, typography groups as `--hf-type-<name>-size`, `-line-height`, `-weight` and `-tracking`, spacing, shape, size, layout, motion). This is the only file allowed to contain design literals.
- [ ] T007 Create `frontend/src/styles/base.css` with: a box-sizing reset; `body { margin: 0; background: var(--hf-color-background); color: var(--hf-color-text); font-family: var(--hf-font-family); -webkit-font-smoothing: antialiased; }`; links in `--hf-color-primary` with `--hf-color-primary-hover` on hover; `:focus-visible` for links using `box-shadow: var(--hf-focus-ring)`; and a `.hf-visually-hidden` utility class. Replace the contents of `frontend/src/styles.css` with `@import` of `styles/tokens.css` and `styles/base.css`.
- [ ] T008 [P] In `frontend/src/index.html`, set `lang="en-GB"`, add the Google Fonts preconnects and the Inter 400/500/600/700 stylesheet link used in `Design/Job Application Page.dc.html` (lines 11–13), and set `<title>` to `HireFlow`.

### Shared UI (the only three shared components, Principle III)

- [ ] T009 [P] Create `frontend/src/app/shared/ui/button/button.ts` (`.html`, `.css`): the `Button` component, applied as an attribute to native `<button>` and `<a>` elements with the selector `button[hfButton], a[hfButton]`. It takes `variant = input<'primary'|'secondary'|'quiet'>('primary')`, `size = input<'sm'|'md'|'lg'>('md')`, `busy = input(false)` and `fullWidth = input(false)`. Use host bindings for classes, and set `aria-disabled` when `busy()` is true. The styles must match the style sheet's §04 Button: heights `--hf-size-control-*`; primary fill and border `--hf-color-primary` with hover `--hf-color-primary-hover`; secondary uses surface, `--hf-color-border-strong`, and on hover `--hf-color-background` and `--hf-color-border-hover`; quiet is transparent with hover `--hf-color-primary-tint`; radius `--hf-radius-control`; `:focus-visible` uses `box-shadow: var(--hf-focus-ring)`; transition `--hf-duration-fast`. Use no gradients and no shadows except the focus ring.
- [ ] T010 [P] Create `frontend/src/app/shared/ui/text-input/text-input.ts` (`.html`, `.css`): the `TextInput` component (`hf-text-input`). It takes `label = input.required<string>()`, `labelSuffix = input<string|null>(null)` (shows "(optional)" in `--hf-color-text-subtle`, weight 400), `hint = input<string>('')`, `error = input<string|null>(null)`, `type = input<'text'|'email'|'url'>('text')`, `multiline = input(false)`, `rows = input(5)`, `maxLength = input<number|null>(null)`, `placeholder = input('')`, `readonly = input(false)`, `autocomplete = input<string>('off')` and `value = model<string>('')`. It emits `blurred = output<void>()`. Generate a unique id for the label's `for`, for the hint/error `<span id>`, and for `aria-describedby`. Set `aria-invalid="true"` when there is an error. The hint and the error share one slot, and the error replaces the hint (style sheet §05). Styles: 48px height (`--hf-size-control-lg`); 16px text so iOS does not zoom; padding `--hf-space-control-x`; border `--hf-color-border-strong`, `--hf-color-border-hover` on hover, `--hf-color-error` when invalid; `:focus` uses `--hf-focus-halo`, or `--hf-focus-halo-error` when invalid; the multiline variant uses `--hf-type-body-line-height` with vertical resize; the slot uses caption type, `--hf-color-text-subtle`, or `--hf-color-error` when invalid.
- [ ] T011 [P] Create `frontend/src/app/shared/ui/card/card.ts` (`.html`, `.css`): the `Card` component (`hf-card`), wrapping `<ng-content>`. It takes `emphasis = input(false)`, which switches the border to `--hf-color-primary`, and `as = input<'section'|'aside'|'div'>('div')` (use `@switch` to render the semantic element). Styles: surface background, a `--hf-border-width` `--hf-color-border` border, `--hf-radius-card`, padding `--hf-space-4`, and `--hf-space-3` at `@media (max-width: 420px)`. No hover effect and no shadow.

### App shell (core singletons)

- [ ] T012 [P] Create `frontend/src/app/core/layout/site-header.ts` (`.html`, `.css`): the `SiteHeader` component (`hf-site-header`), matching `Design/Job Application Page.dc.html` lines 34–42. It is a `<header>` with a surface background and bottom border. Its inner row is capped at `--hf-layout-max-width`, with padding `--hf-space-3` × `--hf-space-4`. It contains a 24px brand square (`--hf-color-primary`, `--hf-radius-control`), the brand text "HireFlow" (16px body type, semibold, primary colour), and a `routerLink="/roles"` link "All open roles".
- [ ] T013 [P] Create `frontend/src/app/core/layout/site-footer.ts` (`.html`, `.css`): the `SiteFooter` component (`hf-site-footer`), matching design lines 178–186. It is a `<footer>` with a top border and contains "Powered by HireFlow" in caption type, `--hf-color-text-subtle`, plus "Privacy" and "Accessibility" links in caption type. Their destinations are an open question (contracts/routes-and-states.md), so render them as `<a href="#">` with a `// TODO(content): destination` comment in the `.ts` file.
- [ ] T014 Update `frontend/src/app/app.ts` and `app.html` so the root `App` renders `<hf-site-header>`, then `<main id="main">` containing `<router-outlet>`, then `<hf-site-footer>`. In `app.css`, make the layout a full-height column with the main area flexing (design line 32). Update `frontend/src/app/app.config.ts` to use `provideRouter(routes, withComponentInputBinding())` and keep the CLI's zoneless provider (depends on T012, T013).

### Models and role content

- [ ] T015 [P] Create one interface per file in `frontend/src/app/features/job-application/models/`, as defined in `specs/001-job-application-form/data-model.md`: `job-role.ts` (`JobRole`, `RoleFacts`, `RoleSection`, `HiringManager`), `cv-file.ts` (`CvFile`), `application-draft.ts` (`ApplicationDraft` plus an exported `EMPTY_DRAFT` constant), `job-application.ts` (`JobApplication`), `application-errors.ts` (`ApplicationField` union and `ApplicationErrors`) and `form-state.ts` (`FormStatus = 'editing'|'submitting'|'failed'` and `FormState { attempted: boolean; status: FormStatus }`).
- [ ] T016 [P] Create `frontend/src/app/features/job-application/data/senior-dotnet-engineer.ts`, exporting `SENIOR_DOTNET_ENGINEER: JobRole`. Copy every string word for word from `Design/Job Application Page.dc.html`: lines 47–49 (company "Northgate Labs", team "Platform", title, summary), lines 54–82 (facts and hiring manager Dana Kowalski, initials "DK"), and lines 88–95 (the two intro paragraphs plus "What you'll do", "What we're looking for" and "How we hire", each with its paragraph). Set `id: 'senior-dotnet-engineer'` and `responseBy: '5 September'`.

### Storage (core) and service wiring

- [ ] T017 [P] Create `frontend/src/app/core/storage/storage-error.ts`, exporting `class StorageError extends Error` with `readonly reason: 'unreadable' | 'unavailable'` (contracts/services.md).
- [ ] T018 Create `frontend/src/app/core/storage/storage.service.ts`, the `StorageService` (`providedIn: 'root'`), with `read<T>(key, isValid)` and `write<T>(key, value)` exactly as specified in `specs/001-job-application-form/contracts/services.md`. Wrap every `localStorage` call in try/catch and turn failures into `StorageError` (depends on T017).
- [ ] T019 Create `frontend/src/app/core/storage/storage.service.spec.ts` with Vitest unit tests for each case listed for StorageService in contracts/services.md: a missing key returns `null`; a value round-trips; invalid JSON gives `unreadable`; a failed `isValid` check gives `unreadable`; `localStorage.setItem` throwing (stub it with `vi.spyOn(Storage.prototype, 'setItem')`) gives `unavailable`. Clear `localStorage` in `beforeEach`. Run `npm test` (depends on T018).
- [ ] T020 [P] Create `frontend/src/app/features/job-application/services/application.tokens.ts`, exporting `SUBMIT_LATENCY_MS = new InjectionToken<number>('SUBMIT_LATENCY_MS', { factory: () => 600 })` and `SAVE_FAILURE_SIMULATION = new InjectionToken<SaveFailureSimulation>(…)`. `SaveFailureSimulation` has `arm(): void` and `consumeOnce(): boolean`, and its root factory returns a simple flag object (`arm` sets a flag, and `consumeOnce` returns the flag and clears it) (research R7).

### Routing skeleton

- [ ] T021 Create `frontend/src/app/features/job-application/job-application.routes.ts`, exporting `JOB_APPLICATION_ROUTES: Routes`. It has `apply` (`loadComponent: () => import('./pages/apply-page/apply-page').then(m => m.ApplyPage)`, title "Apply: Senior .NET Engineer · Northgate Labs") and `confirmation` (lazy `ConfirmationPage`, title "Application sent · Northgate Labs"). In `frontend/src/app/app.routes.ts`, add `{ path: '', pathMatch: 'full', redirectTo: 'apply' }`, spread `...JOB_APPLICATION_ROUTES` (each child uses `loadComponent`), and add `{ path: '**', redirectTo: 'apply' }` (contracts/routes-and-states.md). Create placeholder `ApplyPage` and `ConfirmationPage` components at `frontend/src/app/features/job-application/pages/apply-page/apply-page.ts` and `pages/confirmation-page/confirmation-page.ts`, so the app builds. Their real content arrives in US1.

**Checkpoint**: `npm start` shows the header and footer from the design on `/apply`. `npm test`, `npm run lint` and `npm run build` all pass.

---

## Phase 3: User Story 1 - Apply for the advertised role (Priority: P1) 🎯 MVP

**Goal**: The candidate sees the full role page, fills in the form, sends it, and lands on a
confirmation that names them and the role. "Start again" returns an empty form.

**Independent Test**: Run quickstart checks 1, 7 and 9. Open `/apply`, fill in valid details and
send. `/confirmation` shows "Thanks Ravi.", the role line, and "We'll contact you at …". Select
"Start again" and the form is empty.

### Unit tests for User Story 1

- [ ] T022 [P] [US1] Create `frontend/src/app/features/job-application/services/application.service.spec.ts` with these tests for `ApplicationService.submit`:
  - it appends to an existing `applications` array and keeps earlier records;
  - it trims every field and stores `linkedInUrl: null` when the field is empty or whitespace;
  - it sets `id` to a UUID and sets `submittedAt` to ISO 8601;
  - it copies `roleId`, `jobTitle` and `company` from the role;
  - it sets `latest()` to the new record.

  Provide `{ provide: SUBMIT_LATENCY_MS, useValue: 0 }`. Use realistic draft data (Ravi Shah, `ravi.shah@fastmail.co.uk`, a CV of `{ fileName: 'Ravi-Shah-CV-2026.pdf', sizeBytes: 248312 }`, and a cover note of 50 or more characters). The tests must fail until T024 is written.

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create `frontend/src/app/features/job-application/services/is-job-application-array.ts`, exporting the type guard `isJobApplicationArray(value: unknown): value is JobApplication[]`. It implements the shape check in `specs/001-job-application-form/contracts/storage-schema.md`, and extra properties are allowed.
- [ ] T024 [US1] Create `frontend/src/app/features/job-application/services/application.service.ts`, the `ApplicationService` (`providedIn: 'root'`). It has a private `#latest = signal<JobApplication|null>(null)` and a public `latest = this.#latest.asReadonly()`. Its `async submit(role: JobRole, draft: ApplicationDraft): Promise<JobApplication>`:
  1. awaits `SUBMIT_LATENCY_MS` with a `setTimeout` promise;
  2. reads `applications` through `StorageService.read('applications', isJobApplicationArray)`, treating `null` as `[]`;
  3. builds the record with `crypto.randomUUID()` and the trimmed fields (`linkedInUrl.trim() || null`);
  4. writes `[...existing, record]`;
  5. sets `#latest`;
  6. returns the record.

  Any `StorageError` propagates. It never writes when the read failed (contracts/services.md). Run T022's tests until they pass (depends on T018, T020, T023).
- [ ] T025 [P] [US1] Create `frontend/src/app/features/job-application/components/role-header/role-header.ts` (`.html`, `.css`), `RoleHeader` (`hf-role-header`), with `role = input.required<JobRole>()`. It renders the "{company} · {team}" line (label type, muted colour), the `<h1>` title (page-title tokens; `--hf-font-size-page-title-compact` at ≤420px; `--hf-font-size-display` at ≥900px), and the summary (body type, muted colour), matching design lines 46–50, with a gap of `--hf-space-2` and bottom padding `--hf-space-5`.
- [ ] T026 [P] [US1] Create `frontend/src/app/features/job-application/components/role-facts/role-facts.ts` (`.html`, `.css`), `RoleFacts` (`hf-role-facts`), with `role = input.required<JobRole>()`. Use `<hf-card as="aside">` and a `<dl>`. Render Salary, Location, Contract and Team (each label in caption type, subtle colour; each value in body type, semibold), then a divider (`--hf-color-border`), then "Applications close", then the hiring manager row: a 32px pill avatar with initials (`--hf-color-primary-tint` / `--hf-color-primary`), the name in label type, semibold, and "Hiring manager" in caption type. This follows design lines 54–83, with the list gap `--hf-space-4` (snapped from 20px, research R8).
- [ ] T027 [P] [US1] Create `frontend/src/app/features/job-application/components/role-description/role-description.ts` (`.html`, `.css`), `RoleDescription` (`hf-role-description`), with `sections = input.required<readonly RoleSection[]>()`. It renders each section with `@for (section of sections(); track $index)`: an optional `<h2>` in subtitle type with top margin `--hf-space-2`, and `<p>` elements in body type with `--hf-line-height-reading`. The gap is `--hf-space-3`, matching design lines 87–96.
- [ ] T028 [P] [US1] Create `frontend/src/app/features/job-application/components/cv-picker/cv-picker.ts` (`.html`, `.css`), `CvPicker` (`hf-cv-picker`). It has `file = input<CvFile|null>(null)`, `error = input<string|null>(null)` and `disabled = input(false)`, and emits `fileChosen = output<CvFile>()` and `removed = output<void>()`.
  - **No file chosen**: show a "CV" label, then a dashed drop zone (`--hf-border-width-dropzone`, `--hf-color-border-strong`; primary border and `--hf-color-primary-tint` while dragging or hovering; `--hf-color-background` fill; error border when `error()` is set). Inside it, put a real `<button type="button">` "Choose a file" that calls `click()` on a hidden `<input type="file" accept=".pdf,.doc,.docx" class="hf-visually-hidden">`, plus the line "or drag it here · PDF, DOC or DOCX up to 10MB".
  - **File chosen**: show a row with a 32px "PDF/DOC" badge, the file name (with ellipsis), and the size formatted as in design lines 222–224 (KB, or MB to 1 decimal place), plus a quiet small `hfButton` "Remove".
  - **Slot**: below both views, the hint or error slot, with the hint "PDF, DOC or DOCX, up to 10MB.". It has an id that the button's `aria-describedby` references.
  - **Events**: handle `dragover`, `dragleave` and `drop` with `preventDefault()`. Track a local `dragging = signal(false)`. Emit only `{ fileName, sizeBytes }`, never the file's contents (Clarification Q1).

  This follows design lines 125–147 and research R9.
- [ ] T029 [US1] Create `frontend/src/app/features/job-application/components/application-form/application-form.ts` (`.html`, `.css`), `ApplicationForm` (`hf-application-form`). It is presentational. It takes `draft = input.required<ApplicationDraft>()`, `errors = input<ApplicationErrors>({})` and `status = input<FormStatus>('editing')`, and emits `fieldChange = output<{ field: Exclude<ApplicationField,'cv'>; value: string }>()`, `cvChange = output<CvFile|null>()` and `send = output<void>()`. Render it inside `<hf-card as="section">`, in this order:
  1. `<h2>` "Apply for this role" (section-title tokens) and "Takes about five minutes. We reply to every application." (body-small, muted);
  2. an alert slot `<ng-content select="[formAlert]">`;
  3. Full name (`autocomplete="name"`, placeholder "Ravi Shah", hint "As it appears on your CV.") and Email (`type="email"`, `autocomplete="email"`, placeholder "name@company.com", hint "We'll only use this about your application."), placed in a `.pair` wrapper that becomes a 2-column grid with gap `--hf-space-3` at ≥900px;
  4. LinkedIn profile URL (`type="url"`, `labelSuffix="(optional)"`, placeholder "https://www.linkedin.com/in/your-name", hint "Paste the link to your public profile.") on a full row;
  5. `<hf-cv-picker>`;
  6. Cover note (`multiline`, `maxLength` 500, placeholder "Anything you'd like Dana to know before reading your CV.", no "(optional)"), with a counter hint computed as "50 to 500 characters." when empty, otherwise "{n} / 500 characters";
  7. a row with `<button hfButton size="lg" type="submit">` "Send application" (flex `1 1 auto`, min-width `--hf-size-button-min`) and the privacy line "Your details go to Northgate Labs only. We delete applications six months after the role closes." (caption, subtle).

  Wrap everything in `<form novalidate (ngSubmit)>`, or use a native submit handler that calls `preventDefault()`, so that Enter sends. Forward each input's `valueChange` to `fieldChange`. Cut the cover note to 500 characters before emitting (depends on T009–T011, T028).
- [ ] T030 [US1] Implement `frontend/src/app/features/job-application/pages/apply-page/apply-page.ts` (`.html`, `.css`), `ApplyPage`. It is the smart page.
  - **State**: `draft = signal<ApplicationDraft>(EMPTY_DRAFT)`, `attempted = signal(false)`, `status = signal<FormStatus>('editing')`, `role = SENIOR_DOTNET_ENGINEER`.
  - **Handlers**: `onFieldChange` and `onCvChange` update `draft` immutably.
  - **`onSend()`**: if the status is not `'submitting'`, set it to `'submitting'`, then `await applicationService.submit(role, draft())`, then `router.navigate(['/confirmation'], { replaceUrl: true })`. Validation, failure and retry are added in US2 and US3.
  - **Layout** (design lines 44–176): `<hf-role-header>`, then a `.cols` wrapper. Below 900px it is a single column with gap `--hf-space-5`, and facts come before the main column. At ≥900px it is a grid of `minmax(0,1fr) var(--hf-layout-facts-width)` with column gap `--hf-space-layout-56`; facts sit in column 2, sticky at top `--hf-space-5`. The main column holds `<hf-role-description>` and `<hf-application-form>` with gap `--hf-space-layout-40`.
  - **Page padding**: `--hf-space-layout-40` / `--hf-space-4` / `--hf-space-layout-80`, capped at `--hf-layout-max-width`. At ≤420px the side padding is `--hf-space-3`.

  (depends on T024–T029)
- [ ] T031 [P] [US1] Create `frontend/src/app/features/job-application/components/confirmation-card/confirmation-card.ts` (`.html`, `.css`), `ConfirmationCard` (`hf-confirmation-card`), with `application = input.required<JobApplication>()`, `responseBy = input.required<string>()` and `hiringManagerFirstName = input.required<string>()`. It emits `startAgain = output<void>()`, and has a computed `firstName` (the first word of the trimmed `fullName`, or "there" if empty). Render it inside `<hf-card emphasis as="section">` with padding `--hf-space-5` and gap `--hf-space-3`:
  - a 40px pill "✓" badge (primary tint and primary, `aria-hidden="true"`);
  - `<h2 tabindex="-1" #heading>` "Application sent";
  - a body paragraph (reading line-height, muted): "Thanks {firstName}. Your application for {jobTitle} at {company} is in. {hiringManagerFirstName} and the Platform team review applications every Thursday, and you'll hear from us either way by {responseBy}. We'll contact you at {email}." (FR-015, FR-016);
  - actions: `<a hfButton routerLink="/roles">` "Browse other roles" (primary, md) and `<button hfButton variant="secondary" type="button">` "Start again".

  This follows design lines 162–172. Expose `focusHeading()` through `viewChild`.
- [ ] T032 [US1] Implement `frontend/src/app/features/job-application/pages/confirmation-page/confirmation-page.ts` (`.html`, `.css`), `ConfirmationPage`. It is the smart page. It reads `application = inject(ApplicationService).latest`, renders the same `<hf-role-header>` and, `@if (application(); as app)`, a `<hf-confirmation-card>` (`hiringManagerFirstName` comes from `role.facts.hiringManager.name.split(' ')[0]`). `startAgain` navigates to `/apply`. In `afterNextRender`, call the card's `focusHeading()`. Use the same page padding and max width as `ApplyPage`, with the card in a column capped at the main-column width (depends on T024, T031).

**Checkpoint**: Quickstart checks 1, 7 and 9 pass by hand. `npm test` is green. US1 works as an MVP for valid input.

---

## Phase 4: User Story 2 - Get told clearly what needs fixing (Priority: P1)

**Goal**: Invalid sends are blocked. Inline errors and a summary appear after the first attempt
and clear live as the candidate fixes them. CV type and size are checked as soon as a file is
chosen.

**Independent Test**: Run quickstart checks 2, 3, 4 and 5 against `/apply`.

### Unit tests for User Story 2

- [ ] T033 [P] [US2] Create `frontend/src/app/features/job-application/validation/application-validation.spec.ts`, with Vitest table tests for `validateApplication`, `validateCvFile` and `errorSummary`, covering every rule and exact message in the data-model.md validation table:
  - name and email that are empty or whitespace only;
  - `ravi@northgate` → domain error;
  - LinkedIn: `''` and `'   '` pass; `https://www.linkedin.com/in/ravi-shah`, `http://linkedin.com/in/ravi` and `www.linkedin.com/in/ravi` pass; `ravi shah`, `linkedin` and `mailto:ravi@x.com` fail;
  - cover note: whitespace only → "Add a short cover note."; 49 trimmed characters → minimum error; exactly 50 → pass; 500 → pass;
  - CV: `null` → "Attach your CV to apply."; `.png` → type error; `.PDF` and `.Docx` pass; exactly 10,485,760 bytes passes; 10,485,761 → size error;
  - each field returns only its first failing rule;
  - `errorSummary(1)` and `errorSummary(3)` copy.

  These tests must fail until T034 is written.

### Implementation for User Story 2

- [ ] T034 [US2] Create `frontend/src/app/features/job-application/validation/application-validation.ts`, exporting the pure functions `validateApplication(draft): ApplicationErrors`, `validateCvFile(file): string | null` and `errorSummary(count): string`. Rules and copy come exactly from data-model.md. The email regex is `^[^\s@]+@[^\s@]+\.[^\s@]+$`. LinkedIn is checked by trimming the value, adding `https://` when it has no scheme, parsing it with `new URL()` inside try/catch, and requiring the protocol to be `http:` or `https:`, the hostname to contain a dot, and the original value to contain no whitespace. Keep the field check order the same as the table. Run T033's tests until they pass.
- [ ] T035 [P] [US2] Create `frontend/src/app/features/job-application/components/form-alert/form-alert.ts` (`.html`, `.css`), `FormAlert` (`hf-form-alert`). It takes `title = input.required<string>()`, `body = input.required<string>()` and `actionLabel = input<string|null>(null)`, and emits `action = output<void>()`. It renders a `<div role="alert" tabindex="-1">` with an `--hf-color-error-tint` background, an `--hf-color-error` border, `--hf-radius-control`, padding `--hf-space-3` and gap `--hf-space-1`, containing the title (body-small, semibold, error colour), the body (body-small, muted) and, when `actionLabel` is set, a secondary small `hfButton`. It exposes `focus()` through a host `ElementRef`. This follows design lines 105–110.
- [ ] T036 [US2] Update `frontend/src/app/features/job-application/pages/apply-page/apply-page.ts` and `.html` to add validation:
  - `errors = computed(() => this.attempted() ? validateApplication(this.draft()) : cvOnlyErrors(this.draft()))`, where `cvOnlyErrors` returns `{ cv }` only when a chosen file fails `validateCvFile` (spec FR-011's exception);
  - `errorCount = computed(...)`;
  - in `onSend()`, first set `attempted.set(true)`; if `errorCount() > 0`, focus the summary alert through `viewChild(FormAlert)` after the next render and return without calling submit.

  Project `<hf-form-alert formAlert [title]="errorSummary(errorCount())" body="Check the highlighted fields below.">` into the form `@if (attempted() && errorCount() > 0 && status() !== 'failed')`, and pass `errors()` into `<hf-application-form>` (depends on T034, T035).
- [ ] T037 [US2] Update `frontend/src/app/features/job-application/components/application-form/application-form.ts` and `.html` to pass `errors().fullName`, `.email`, `.linkedInUrl` and `.coverNote` into each `hf-text-input`'s `error` input, and `errors().cv` into `<hf-cv-picker [error]>`. Confirm that each control's `aria-describedby` points at the slot showing the error, and that `aria-invalid` toggles (FR-010, FR-025).
- [ ] T038 [US2] Update `frontend/src/app/features/job-application/components/cv-picker/cv-picker.ts`: when the candidate selects **Remove** after a send attempt, the parent's computed errors bring the "Attach your CV to apply." message back. Confirm `removed` → `cvChange(null)` flows through `ApplyPage.onCvChange`. Also reset the hidden file input's `value`, so choosing the same file again fires `change` (spec edge case "Removing the CV after an attempt").

**Checkpoint**: Quickstart checks 2–5 pass by hand, US1's checks still pass, and `npm test` is green.

---

## Phase 5: User Story 3 - Recover when sending fails (Priority: P2)

**Goal**: The visible submitting state blocks double sends and edits. A save failure shows an
alert that keeps the candidate's data, and they can retry.

**Independent Test**: Run quickstart checks 6, 10 and 12. Use `/apply?simulateFailure=once`: the
first send shows the failure alert, the values are kept, and **Try again** reaches the
confirmation with exactly one new record.

### Unit tests for User Story 3

- [ ] T039 [P] [US3] Create `frontend/src/app/features/job-application/validation/form-transitions.spec.ts`, testing `nextOnSend(state, errors)`: `'ignore'` when the status is `'submitting'` (whatever the errors), `'blocked'` when there are errors, `'submit'` when there are none, from both `'editing'` and `'failed'`. These tests must fail until T041 is written.
- [ ] T040 [P] [US3] Add to `frontend/src/app/features/job-application/services/application.service.spec.ts`:
  - with `setItem` stubbed to throw, `submit` rejects with `StorageError('unavailable')` and `latest()` is unchanged;
  - when `SAVE_FAILURE_SIMULATION` is armed, the first `submit` rejects, nothing is written, and the second call succeeds;
  - when `applications` holds `'{oops'`, `submit` rejects with `unreadable` and `localStorage.getItem('applications')` is still exactly `'{oops'`.

### Implementation for User Story 3

- [ ] T041 [US3] Create `frontend/src/app/features/job-application/validation/form-transitions.ts`, exporting the pure function `nextOnSend(state: FormState, errors: ApplicationErrors): 'blocked' | 'submit' | 'ignore'`, as in data-model.md. Run T039's tests until they pass.
- [ ] T042 [US3] Update `frontend/src/app/features/job-application/services/application.service.ts`: inject `SAVE_FAILURE_SIMULATION`. After the latency and before any read or write, `if (simulation.consumeOnce()) throw new StorageError('unavailable')`. Run T040's tests until they pass.
- [ ] T043 [US3] Update `frontend/src/app/features/job-application/pages/apply-page/apply-page.ts` and `.html`:
  - **`onSend()`**: route through `nextOnSend({ attempted: attempted(), status: status() }, validateApplication(draft()))`. On `'ignore'`, return. On `'blocked'`, use the US2 behaviour. On `'submit'`, set the status to `'submitting'`, then `try { await submit; navigate } catch { status.set('failed') }`.
  - **Edits**: `onFieldChange` and `onCvChange` do nothing while submitting (FR-013).
  - **Failure alert**: `@if (status() === 'failed')`, project `<hf-form-alert formAlert title="We couldn't send your application." body="Nothing you entered has been lost. Please try again in a moment." actionLabel="Try again" (action)="onSend()">`. Hide the validation summary while it shows.
  - **Simulated failure**: in the constructor, if `isDevMode()` and `ActivatedRoute.snapshot.queryParamMap.get('simulateFailure') === 'once'`, call `inject(SAVE_FAILURE_SIMULATION).arm()` (research R7).

  (depends on T041, T042)
- [ ] T044 [US3] Update `frontend/src/app/features/job-application/components/application-form/application-form.ts` and `.html` for the submitting state:
  - pass `[readonly]="status() === 'submitting'"` to every `hf-text-input` and `[disabled]` to `hf-cv-picker`;
  - the submit button gets `[busy]="status() === 'submitting'"` and the label `@if (status() === 'submitting') { Sending… } @else { Send application }`;
  - add `<p class="hf-visually-hidden" aria-live="polite">` that reads "Sending your application…" while submitting;
  - the form's submit handler ignores submits while busy.

  This is a belt-and-braces guard in addition to `nextOnSend` (FR-019, research R9).
- [ ] T045 [US3] Update `frontend/src/app/shared/ui/button/button.css` so that a busy button keeps the primary fill, uses `cursor: progress` and does not change to a hover colour. Update `frontend/src/app/shared/ui/text-input/text-input.css` so that a read-only input uses a `--hf-color-background` fill and `--hf-color-text-muted` text, matching the style sheet's locked-input pattern (§05 disabled), while keeping AA contrast.

**Checkpoint**: Quickstart checks 6, 10 and 12 pass by hand, earlier checks still pass, and
`npm test` is green.

---

## Phase 6: User Story 4 - The application is still there after a reload (Priority: P2)

**Goal**: Saved applications survive a reload and a browser restart. `/confirmation` rebuilds from
storage, an empty or corrupt store redirects to `/apply`, and "Start again" never deletes records.

**Independent Test**: Run quickstart checks 8, 9, 11 and 13. Send, then reload `/confirmation` and
see the same details. Restart the browser and see them again. Corrupt the storage and
`/confirmation` sends you to `/apply`.

### Unit tests for User Story 4

- [ ] T046 [P] [US4] Add to `frontend/src/app/features/job-application/services/application.service.spec.ts`:
  - when the service is created with two saved records in `localStorage`, `latest()` equals the second;
  - with `'{oops'` stored, `latest()` is `null` and nothing throws;
  - after "Start again" and a second `submit`, the array holds both records in order.

  Use `TestBed.resetTestingModule()` between cases, so the service is created fresh each time.

### Implementation for User Story 4

- [ ] T047 [US4] Update `frontend/src/app/features/job-application/services/application.service.ts` so that its constructor loads `latest` once from storage: `try { const all = storage.read('applications', isJobApplicationArray); this.#latest.set(all?.at(-1) ?? null) } catch { this.#latest.set(null) }`. Run T046's tests until they pass.
- [ ] T048 [P] [US4] Create `frontend/src/app/features/job-application/guards/has-application-guard.ts`, exporting `hasApplicationGuard: CanActivateFn`, which returns `inject(ApplicationService).latest() ? true : inject(Router).createUrlTree(['/apply'])` (contracts/routes-and-states.md).
- [ ] T049 [US4] Update `frontend/src/app/features/job-application/job-application.routes.ts` to add `canActivate: [hasApplicationGuard]` to the `confirmation` route (depends on T048).
- [ ] T050 [US4] Check `frontend/src/app/features/job-application/pages/apply-page/apply-page.ts`: it MUST always start from `EMPTY_DRAFT` and keep no draft state across reloads (FR-023), and it MUST NOT redirect to `/confirmation` when an application exists (Clarification on routes). Confirm that `ConfirmationPage`'s "Start again" only navigates and never calls storage (FR-022). Write down any fix in the task's commit.

**Checkpoint**: Quickstart checks 8, 9, 11 and 13 pass by hand, and all four stories work
together.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates from the constitution, accessibility, responsiveness, and the
acceptance record.

- [ ] T051 [P] Run the hard-coded-value check from `specs/001-job-application-form/quickstart.md` ("Check for hard-coded design values") in `frontend/`. Fix every match by replacing it with a `var(--hf-*)` token. If a genuinely new value is needed, add it to `frontend/src/styles/tokens.css` **and** `specs/001-job-application-form/contracts/design-tokens.md`, with its design source.
- [ ] T052 [P] Check responsiveness at 360px, 420px, 899px and 900px against `Design/Job Application Page.dc.html` and `Design/Job Application Mobile.dc.html`: no horizontal scroll in any state; a long LinkedIn URL and a long CV file name truncate or wrap; facts sit above the description below 900px and are sticky beside it at 900px and above. Fix issues in the affected component `.css` files (quickstart check 14).
- [ ] T053 [P] Check accessibility using only the keyboard and with NVDA or Narrator, as in quickstart checks 15–16. Run an axe or Lighthouse audit on each of the five states. Fix any contrast, labelling, focus-order or announcement issue in the affected component.
- [ ] T054 Run `npm run lint`, `npm run format:check`, `npm test` and `npm run build` in `frontend/`, and fix everything until all four exit 0. Confirm `frontend/dist/` has no server output (research R1).
- [ ] T055 Create `specs/001-job-application-form/checklists/acceptance.md` with one row per quickstart manual check (1–17): check number, spec references, date, result (pass/fail) and notes. Then run every check and record the results (Principle V; workshop exception). Fix any failure before you mark this task done.
- [ ] T056 [P] Update the repo-root `CLAUDE.md` "Project state" section. Replace "no application code yet" with a short description of the app in `frontend/` and the commands from quickstart.md (`npm start`, `npm test`, `npm run lint`, `npm run format:check`, `npm run build`, all run from `frontend/`), plus how to run a single spec file: `npx ng test --include src/app/path/to/file.spec.ts`.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup. It blocks every story.
- **US1 (Phase 3)**: depends on Foundational. This is the MVP.
- **US2 (Phase 4)**: depends on US1. It extends `ApplyPage`, `ApplicationForm` and `CvPicker`.
- **US3 (Phase 5)**: depends on US1. It extends `ApplyPage`, `ApplicationForm` and
  `ApplicationService`. It can run after or alongside US2, but both edit `apply-page.ts`, so do
  them in sequence: US2, then US3.
- **US4 (Phase 6)**: depends on US1 (`ApplicationService`, `ConfirmationPage`). It does not depend
  on US2 or US3, so it can run in parallel with them, apart from T050's review of
  `apply-page.ts`.
- **Polish (Phase 7)**: depends on every story being complete.

### Within each story

- Write the unit-test tasks first and confirm they fail. Then do the implementation task named in
  each test task.
- The order is: models and guards, then services, then presentational components, then smart
  pages.

### Parallel opportunities

- **Setup**: T003 and T004.
- **Foundational**:
  - T008, T009, T010, T011, T012, T013, T015, T016, T017 and T020 all touch different files;
  - T018 → T019 runs in sequence;
  - T014 waits for T012 and T013;
  - T021 waits for T015.
- **US1**: T022, T023, T025, T026, T027, T028 and T031 run in parallel. Then T024, then T029,
  then T030, then T032.
- **US2**: T033 and T035 run in parallel. Then T034, then T036, then T037 and T038.
- **US3**: T039 and T040 run in parallel. Then T041 and T042 (different files, so also parallel),
  then T043, then T044 and T045.
- **US4**: T046 and T048 run in parallel. Then T047 and T049.
- **Polish**: T051, T052, T053 and T056 run in parallel. Then T054, then T055.

---

## Parallel Example: User Story 1

```text
# After Phase 2, start these together (different files, no dependencies between them):
Task: "T022 [US1] ApplicationService unit tests in frontend/src/app/features/job-application/services/application.service.spec.ts"
Task: "T023 [US1] isJobApplicationArray guard in frontend/src/app/features/job-application/services/is-job-application-array.ts"
Task: "T025 [US1] RoleHeader in frontend/src/app/features/job-application/components/role-header/role-header.ts"
Task: "T026 [US1] RoleFacts in frontend/src/app/features/job-application/components/role-facts/role-facts.ts"
Task: "T027 [US1] RoleDescription in frontend/src/app/features/job-application/components/role-description/role-description.ts"
Task: "T028 [US1] CvPicker in frontend/src/app/features/job-application/components/cv-picker/cv-picker.ts"
Task: "T031 [US1] ConfirmationCard in frontend/src/app/features/job-application/components/confirmation-card/confirmation-card.ts"

# Then, in sequence: T024 ApplicationService → T029 ApplicationForm → T030 ApplyPage → T032 ConfirmationPage
```

---

## Implementation Strategy

### MVP first (User Story 1)

1. Phase 1 (Setup), then Phase 2 (Foundational).
2. Phase 3 (US1). **Stop and check** with quickstart checks 1, 7 and 9.
3. The demo covers the role page, sending, and the confirmation that names the candidate and the
   role.

### Incremental delivery

1. Add US2 (validation): checks 2–5.
2. Add US3 (submitting, failure and retry): checks 6, 10 and 12. At this point all five designed
   states exist (Principle II).
3. Add US4 (persistence and the reload guard): checks 8, 9, 11 and 13.
4. Polish: quality gates, accessibility, 360px, and the acceptance record. **The feature is "done"
   only when T055 records every check as passing** (Principle V).

---

## Notes

- [P] means different files and no dependency on an unfinished task.
- If any task needs a design value that is not in `contracts/design-tokens.md`, it stops and adds
  the token there and in `tokens.css` first, with its design source.
- Commit after each task or logical group, and run `npm test` and `npm run lint` before each
  commit.
