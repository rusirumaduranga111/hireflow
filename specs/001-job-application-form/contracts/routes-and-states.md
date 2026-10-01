# Contract: Routes and UI states

## Routes (`app.routes.ts` plus `features/job-application/job-application.routes.ts`)

| Path | Loads | Guard | Notes |
|---|---|---|---|
| `''` | redirect to `apply` | none | `pathMatch: 'full'` |
| `apply` | `ApplyPage` (lazy, `loadComponent`) | none | Always opens in the **Default** state with an empty draft. In dev mode, `?simulateFailure=once` arms one simulated save failure. |
| `confirmation` | `ConfirmationPage` (lazy) | `hasApplicationGuard` | Redirects to `/apply` when `ApplicationService.latest()` is `null`. Survives a reload. |
| `**` | redirect to `apply` | none | |

- **Page titles** (Angular `title` route property):
  - `apply`: "Apply: Senior .NET Engineer · Northgate Labs"
  - `confirmation`: "Application sent · Northgate Labs"
- **Out-of-scope link targets**:
  - The header's "All open roles" and the confirmation's "Browse other roles" link to `/roles`.
    Until feature 002 (Open Roles) exists, `/roles` falls through to the `**` redirect.
  - The footer's "Privacy" and "Accessibility" links have no target yet. They are rendered as in
    the design, and their destinations are an open content question.

## Page composition

The block order follows `Design/Job Application Wireframes.dc.html`: **1a** below 900px, and
**2b** at 900px and above, with a sticky facts column (as implemented in
`Design/Job Application Page.dc.html`).

```text
SiteHeader (core/layout)        brand · "All open roles"
ApplyPage (smart)
  RoleHeader                    company · team / title (h1) / summary
  RoleFacts   (hf-card)         salary · location · contract · team · closes · hiring manager
  RoleDescription               intro + 3 headed sections
  ApplicationForm (hf-card)     presentational: inputs = draft, errors, status; outputs = fieldChange, send, retry
    FormAlert                   validation summary | submit failure
    hf-text-input × 3           Full name, Email (pair at ≥900px), LinkedIn profile URL (full row)
    CvPicker                    choose or drop · chosen file (name, size, Remove)
    hf-text-input (multiline)   Cover note + counter
    hf-button (primary, lg)     "Send application" / "Sending…" + privacy line
SiteFooter (core/layout)        "Powered by HireFlow" · Privacy · Accessibility

ConfirmationPage (smart)
  RoleHeader                    same header as /apply
  ConfirmationCard (hf-card, primary border)
                                ✓ · "Application sent" (h2, receives focus)
                                "Thanks {firstName}. Your application for {jobTitle} at {company} is in."
                                "Dana and the Platform team review applications every Thursday, and you'll
                                 hear from us either way by {responseBy}. We'll contact you at {email}."
                                [Browse other roles] (primary link) [Start again] (secondary button)
```

The shared UI is limited to `hf-button`, `hf-text-input` and `hf-card` (Principle III).
`FormAlert`, `CvPicker` and `ConfirmationCard` are used only by this feature, so they live in the
feature folder.

## States: what each one must render

| State | Form card shows | Button | Announced |
|---|---|---|---|
| Default | Help text under each field; counter "50 to 500 characters." | "Send application" | none |
| Validating | `FormAlert` (error variant): summary title and "Check the highlighted fields below."; each invalid field has the error border and its message in place of the help text | "Send application" (stays enabled, FR-012) | `role="alert"` summary; focus moves to the summary |
| Submitting | Fields read-only; CV picker disabled | "Sending…", `aria-disabled="true"` | polite live region: "Sending your application…" |
| Error (submit failure) | `FormAlert` (error variant): "We couldn't send your application." / "Nothing you entered has been lost. Please try again in a moment." / **[Try again]**; all values kept and editable | "Send application" (also retries) | `role="alert"` |
| Success | (on `/confirmation`) `ConfirmationCard` | none | focus moves to the "Application sent" heading |
