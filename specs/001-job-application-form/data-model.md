# Data Model: Job Application Form

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) (R3, R5, R6)

All types are TypeScript interfaces or type aliases in the feature's `models/` folder, one concept
per file. `any` is not used anywhere.

## JobRole (static content)

The advertised role. For this feature it is a single constant, `SENIOR_DOTNET_ENGINEER`, in
`data/senior-dotnet-engineer.ts`, with content copied word for word from
`Design/Job Application Page.dc.html`.

| Field | Type | Example / notes |
|---|---|---|
| `id` | `string` | `'senior-dotnet-engineer'` |
| `title` | `string` | `'Senior .NET Engineer (Remote, UK)'` |
| `company` | `string` | `'Northgate Labs'` |
| `team` | `string` | `'Platform'` (header line "Northgate Labs · Platform") |
| `summary` | `string` | "Own the .NET services behind our scheduling and messaging products." |
| `facts` | `RoleFacts` | see below |
| `description` | `readonly RoleSection[]` | intro paragraphs, then "What you'll do", "What we're looking for", "How we hire" |
| `responseBy` | `string` | `'5 September'` (used in the confirmation's next-steps copy) |

- **RoleFacts**: `salary` ('£78,000 – £92,000'), `location` ('Remote, UK'), `contract`
  ('Permanent, full time'), `teamSize` ('Platform, 9 people'), `closes` ('29 August 2026'),
  `hiringManager: { name: 'Dana Kowalski', title: 'Hiring manager', initials: 'DK' }`.
- **RoleSection**: `{ heading: string | null; paragraphs: readonly string[] }`. The intro section
  has `heading: null`.

## ApplicationDraft (form values, not saved)

What the candidate has typed so far. It is held as signals in `ApplyPage` (R3).

| Field | Type | Initial |
|---|---|---|
| `fullName` | `string` | `''` |
| `email` | `string` | `''` |
| `linkedInUrl` | `string` | `''` |
| `cv` | `CvFile \| null` | `null` |
| `coverNote` | `string` | `''` (input capped at 500 characters) |

- **CvFile**: `{ fileName: string; sizeBytes: number }`. Only metadata is kept. The file's
  contents are never read or stored (Clarification Q1).

## Validation rules

`validateApplication(draft: ApplicationDraft): ApplicationErrors` is a pure function in
`validation/application-validation.ts`. Each field is trimmed before it is checked.

| Field | Rule | Error message (exact) |
|---|---|---|
| `fullName` | required | "Enter your name." |
| `email` | required | "Enter your email address." |
| `email` | matches `^[^\s@]+@[^\s@]+\.[^\s@]+$` | "Add a domain, like name@company.com." |
| `linkedInUrl` | optional: empty passes; if present: optional `http(s)://`, then a host containing a dot, no spaces, nothing else allowed as a scheme | "Enter a full web address, like https://www.linkedin.com/in/your-name." |
| `cv` | required | "Attach your CV to apply." |
| `cv` | extension is `.pdf`, `.doc` or `.docx` (case-insensitive) | "Choose a PDF, DOC or DOCX file." |
| `cv` | `sizeBytes` ≤ 10 × 1024 × 1024 | "That file is over 10MB. Try a smaller one." |
| `coverNote` | required | "Add a short cover note." |
| `coverNote` | trimmed length ≥ 50 | "Tell us a little more: at least 50 characters." |
| `coverNote` | length ≤ 500 | enforced by capping the input; the validator also checks it |

- **ApplicationErrors**: `Partial<Record<ApplicationField, string>>`, where
  `ApplicationField = 'fullName' | 'email' | 'linkedInUrl' | 'cv' | 'coverNote'`. Each field has
  at most one error, the first rule it fails in the table order above.
- **Error summary**: if there is 1 error, "One thing needs fixing before you can send this.";
  otherwise "A few things need fixing before you can send this." This is a pure helper
  (`errorSummary(count)`), also unit-tested.
- **Type and size checks happen when the file is chosen**: when a disallowed file is picked or
  dropped, it is still recorded in the draft, so the error can show against it and "Remove" works.
  Its error appears straight away, even before the first send attempt. This is the one exception
  to the "no errors before the first attempt" rule (FR-011): the candidate has just acted on that
  field, so the feedback is about something they did.

## JobApplication (saved)

One sent application. It is created once by `ApplicationService.submit` and never changed.

| Field | Type | Source |
|---|---|---|
| `id` | `string` | `crypto.randomUUID()` |
| `roleId` | `string` | `JobRole.id` |
| `jobTitle` | `string` | `JobRole.title` |
| `company` | `string` | `JobRole.company` |
| `fullName` | `string` | trimmed |
| `email` | `string` | trimmed |
| `linkedInUrl` | `string \| null` | trimmed; `null` when empty |
| `cv` | `CvFile` | name and size only |
| `coverNote` | `string` | trimmed, 50–500 characters |
| `submittedAt` | `string` | ISO 8601 timestamp from `new Date().toISOString()` |

- **Identity**: `id` is unique. One user action creates at most one record (FR-019): while
  `status === 'submitting'`, `submit` is never called again.
- **Ordering**: records are appended to the array. "Latest" means the last element, which is also
  the one with the newest `submittedAt`.
- **Derived for display**: `firstName = fullName.split(/\s+/)[0]`. It is derived when needed and
  not stored.
- Storage format: [contracts/storage-schema.md](./contracts/storage-schema.md).

## Form state machine (ApplyPage)

The state is made of `attempted: boolean`, `status: 'editing' | 'submitting' | 'failed'`, and
`errors`, which is computed. The five designed states map onto it like this:

| Designed state | Condition |
|---|---|
| **Default** | `status === 'editing'` and `!attempted` |
| **Validating** | `attempted` and `errorCount > 0` (and `status !== 'submitting'`) |
| **Submitting** | `status === 'submitting'` |
| **Error** (submit failure) | `status === 'failed'` |
| **Success** | a save succeeded, so the app navigates to `/confirmation` (ConfirmationPage) |

```text
Default ──send(invalid)──▶ Validating ──edit until valid──▶ (editing, attempted, 0 errors)
   │                          ▲   │                               │
   │                          └───┘ send(invalid)                 │
   └──────────send(valid)──────────────▶ Submitting ◀──send(valid)┘
                                            │   ▲
                              save rejected │   │ retry ("Try again", or "Send application")
                                            ▼   │
                                          Failed ──edit──▶ (stays Failed; the alert stays until the next send)
                                            
Submitting ──save resolved──▶ navigate /confirmation (Success)
Success ──"Start again"──▶ /apply (Default, empty draft)
```

- `send()` sets `attempted = true`. If `errors` is non-empty, it focuses the summary and stops.
  Otherwise it sets `status = 'submitting'` and awaits `ApplicationService.submit(draft)`.
- If the save rejects, `status` becomes `'failed'`, and the draft is kept.
- If the save resolves, the app navigates to `/confirmation` (`replaceUrl`).
- While `submitting`, edits and further sends are ignored (FR-013).
- In `failed`, fields can be edited (US3 #4). The failure alert stays until the next send attempt.
- The decisions about state changes are a pure function, `nextOnSend(state, errors)`, kept next to
  the validators so they can be unit-tested without the component.
