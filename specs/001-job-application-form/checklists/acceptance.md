# Acceptance Record: Job Application Form

**Feature**: [spec.md](../spec.md) | **Checks defined in**: [quickstart.md](../quickstart.md)
**Build under test**: `frontend/` dev server (`npm start`), Angular 22.2, Chromium-based in-app
browser
**Date**: 2026-10-05

Under the constitution's workshop exception (Principle V), UI-level checks are manual. The checks
below were run by driving the real app in the browser (filling in fields, dropping files, clicking
controls, reloading) and reading the rendered DOM and `localStorage`. Unit tests (64, green) cover
the validators, form transitions, `StorageService` and `ApplicationService`.

**Result**: 14 of 17 checks pass, and no check failed. The 3 marked **Pending: human** need a
person: a real screen reader, a browser restart, and a timed first-time run.

| # | Covers | Result | Notes |
|---|---|---|---|
| 1 | US1 #1, FR-001–003 (Default) | ✅ Pass | Role header, facts, description and form match the design copy; help text shows; no errors. |
| 2 | US2 #1–2, FR-005–012 (Validating) | ✅ Pass | Empty send: nothing saved; plural summary, and focus moves to it; name, email, CV and cover-note errors; LinkedIn has no error; `aria-invalid` set. With one field left: singular summary. |
| 3 | US2 #3–5, #9 | ✅ Pass | `ravi@northgate` → domain error; `ravi shah` → LinkedIn error; 49 characters → minimum error; whitespace-only name → "Enter your name." |
| 4 | US2 #7 | ✅ Pass | Errors clear as each field is fixed; the summary goes plural → singular → gone. |
| 5 | Edge: CV | ✅ Pass | `.png` → type error; 10MB + 1 byte → size error; `.docx` accepted (DOCX badge, KB size); Remove after an attempt brings "Attach your CV to apply." back. Focus moves to Remove after choosing, and to the drop zone after removing. |
| 6 | US1 #2, US3 #1, FR-013 (Submitting) | ✅ Pass | "Sending…", `aria-disabled="true"`, all fields read-only, CV picker disabled, live region "Sending your application…". |
| 7 | US1 #3, FR-015–016, SC-005 (Success) | ✅ Pass | `/confirmation`: "Thanks Ravi.", role and company line, "We'll contact you at …"; focus on "Application sent". |
| 8 | US4 #1, FR-020–021, SC-004 | ✅ Pass (reload) · **Pending: human** (browser restart) | A full reload of `/confirmation` rebuilds the same card; the stored record matches `storage-schema.md`. Closing and reopening the browser was not exercised. |
| 9 | US1 #4, US4 #2, FR-022 | ✅ Pass | "Start again" → empty `/apply`; after a second send, `applications` holds 2 records and the confirmation shows the newest. |
| 10 | US3 #2–4, FR-017–018, SC-007 (Error) | ✅ Pass | `?simulateFailure=once`: failure alert, focus moves to it, all values kept, nothing written. Edited LinkedIn while failed → "Try again" → confirmation with 1 record that includes the edit. A real `QuotaExceededError` also produces the same state. |
| 11 | Edge: corrupt storage | ✅ Pass | With `{oops` stored, `/confirmation` redirects to `/apply`; a valid send shows the failure alert; the stored value is still `{oops`. |
| 12 | FR-019, SC-008 | ✅ Pass | 5 rapid clicks plus 5 programmatic submits during a send → exactly 1 new record. |
| 13 | US4 #3, FR-023 | ✅ Pass | A half-typed draft is gone after a reload of `/apply`. |
| 14 | FR-024, SC-009 | ✅ Pass | At 360px: no horizontal scroll in default, validating, long-value, failure or success states; 16px gutter, 28px title, facts above the description, full-width send button; long URL, file name and email wrap or truncate. At 899px: one column; at 900px: two-column grid with sticky facts and the 40px title. |
| 15 | FR-024–025 | **Pending: human** | Automated part passes: tab order is logical (header link → alert action → fields → Remove → cover note → send → footer); every control has a visible `:focus-visible` style; alerts use `role="alert"`; submitting uses a polite live region; errors are linked through `aria-describedby`. **A real screen-reader pass (NVDA or Narrator) has not been done.** |
| 16 | FR-024 | ✅ Pass | axe-core 4.10 (WCAG 2 A and AA plus best practices, colour contrast included): **0 violations** in default, validating, file-chosen, submitting, failure and success states. |
| 17 | SC-001 | **Pending: human** | Needs a timed first-time run by a person. Scripted completion takes about 1s plus the 0.6s save, so the form puts no time barrier in the way. |

## Quality gates (constitution)

| Gate | Result |
|---|---|
| 1. No hard-coded design values outside `tokens.css` | ✅ The quickstart scan finds 0 matches; the only literals are the `@media (max-width: 420px)` and `(min-width: 900px)` breakpoints |
| 2. Every designed state implemented and reachable | ✅ Checks 1, 2, 6, 7 and 10 |
| 3. AA contrast, labelled controls, visible focus, 360px | ✅ Checks 14 and 16 (screen-reader pass pending, check 15) |
| 4. Standalone, OnPush, signal-based, typed, no `any` | ✅ Enforced by lint (`prefer-on-push-component-change-detection`, `prefer-signals`, `no-explicit-any`) |
| 5. Structure, naming and data access per the Engineering Standards | ✅ |
| 6. ESLint, Prettier and unit tests | ✅ `npm run lint`, `npm run format:check` and `npm test` (64 passed) all exit 0 |
| 7. Acceptance criteria | ✅ 14 of 17 pass; 3 pending a person (above) |
| 8. No placeholder content | ✅ Copy comes from the design and the spec; sample data is realistic and made up |
