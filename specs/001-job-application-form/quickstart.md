# Quickstart & Validation: Job Application Form

This guide shows how to run the feature and prove it meets the spec. Under the constitution's
workshop exception, UI and end-to-end checks are **manual**. Record each result in
`checklists/acceptance.md` when implementing (Principle V).

## Prerequisites

- Node 24 LTS and npm 11 (`node --version`, `npm --version`).
- Run every command from `frontend/`.

## Run and check

```powershell
cd frontend
npm ci
npm start            # ng serve → http://localhost:4200/apply
npm test             # ng test (Vitest): validators, form transitions, StorageService, ApplicationService
npm run lint         # ng lint (angular-eslint)
npm run format:check # prettier --check .
npm run build        # production build, browser-only (no server output)
```

Pass condition: all four checks exit 0. The build output contains no `server/` folder (research
R1).

### Check for hard-coded design values (quality gate 1)

```powershell
Get-ChildItem src -Recurse -Include *.css,*.ts |
  Where-Object { $_.Name -ne 'tokens.css' -and $_.Name -notlike '*.spec.ts' } |
  Select-String -Pattern '#[0-9a-fA-F]{3,8}\b|rgba?\(|\b\d+(\.\d+)?(px|rem|em)\b' |
  Where-Object { $_.Line -notmatch '@media' }
```

Pass condition: no output. The only literals allowed are the breakpoints inside `@media` (see
[contracts/design-tokens.md](./contracts/design-tokens.md)).

## Reset between checks

In DevTools, go to Application → Local Storage → `http://localhost:4200` and delete the
`applications` key, or run `localStorage.removeItem('applications')` in the console.

## Manual acceptance checks

Use realistic data, e.g. Ravi Shah, `ravi.shah@fastmail.co.uk`, a real PDF under 10MB, and a cover
note of 60 or more characters. The states are defined in
[contracts/routes-and-states.md](./contracts/routes-and-states.md).

| # | Covers | Steps | Expected |
|---|---|---|---|
| 1 | US1 #1, FR-001–003 (Default) | Open `/apply` | Role header, facts, description and form appear with design copy; help text shows; no errors |
| 2 | US2 #1–2, FR-005–012 (Validating) | Select **Send application** on the empty form | Nothing is saved. Summary reads "A few things need fixing…", and focus is on it. Name, email, CV and cover note errors show; LinkedIn shows none. Then leave only one field invalid and send: the summary reads "One thing needs fixing…" |
| 3 | US2 #3–5, #9 | Enter `ravi@northgate`; LinkedIn `ravi shah`; a 49-character note; spaces only in name; send | Each specific error message from data-model.md appears |
| 4 | US2 #7 | Correct the fields one by one | Each error clears straight away, and the summary count updates and then disappears |
| 5 | Edge: CV | Drop a `.png`; then a file over 10MB; then a valid PDF; then **Remove** after a send attempt | Type error, then size error, then the file name and size show; after Remove, the CV-required error comes back |
| 6 | US1 #2, US3 #1, FR-013 (Submitting) | Fill a valid form (leave LinkedIn empty) and send | For about 0.6s the button reads "Sending…", the fields are read-only, and clicking again does nothing |
| 7 | US1 #3, FR-015–016, SC-005 (Success) | Wait for the save | `/confirmation` shows "Thanks Ravi.", "Senior .NET Engineer (Remote, UK) at Northgate Labs", and "We'll contact you at ravi.shah@fastmail.co.uk."; focus is on the heading |
| 8 | US4 #1, FR-020–021, SC-004 | Reload `/confirmation`; close and reopen the browser and open `/confirmation` | The same confirmation appears. `localStorage.applications` holds one record whose fields match [contracts/storage-schema.md](./contracts/storage-schema.md) |
| 9 | US1 #4, US4 #2, FR-022 | Select **Start again**, then send a second application | `/apply` is empty; after sending, `applications` has 2 records and the confirmation shows the second |
| 10 | US3 #2–4, FR-017–018, SC-007 (Error) | Open `/apply?simulateFailure=once`, fill a valid form and send | The failure alert appears and every value is kept. Edit one field, then select **Try again**: the confirmation appears, and there is exactly 1 new record |
| 11 | Edge: corrupt storage | Run `localStorage.setItem('applications','{oops')`, then open `/confirmation`, then send a valid form on `/apply` | `/confirmation` redirects to `/apply`. Sending shows the failure alert, and the stored value is still `{oops` |
| 12 | FR-019, SC-008 | Double-click or press Enter repeatedly on **Send application** with a valid form | Exactly one new record |
| 13 | US4 #3, FR-023 | Fill in the form without sending, then reload `/apply` | The form is empty (Default) |
| 14 | FR-024, SC-009 | Set the DevTools viewport to 360px wide and go through checks 1, 2, 7 and 10 | No horizontal scroll; layout follows `Design/Job Application Mobile.dc.html` |
| 15 | FR-024–025 | Complete checks 2, 6, 7 and 10 using only the keyboard, with a screen reader on (NVDA or Narrator) | Every control can be reached with a visible focus indicator. The summary, "Sending…", the failure alert and the confirmation heading are announced. Field errors are read with their fields |
| 16 | FR-024 | Run an axe or Lighthouse accessibility audit on each state | No contrast or labelling violations |
| 17 | SC-001 | Time a first-time run from opening `/apply` to the confirmation, with the details ready | Under 2 minutes |
