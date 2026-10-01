# Feature Specification: Job Application Form

**Feature Branch**: `001-job-application-form`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Build the HireFlow Job Application screen. The visual design is in ./design/Job Application Page.dc - reference it, but this spec is about behaviour. Behaviour: Present the application form for the advertised role (fields as shown on the page). Validate required fields and email format; show errors inline; block submit until valid. On submit: persist the application, then show a success/confirmation state. Handle a submit failure with a visible error and the ability to retry. Acceptance criteria: A candidate can complete and submit the application in under 2 minutes. Required fields and email format are validated before submit is allowed. A submitted application persists and survives a page reload. Every state in the design (default / validating / submitting / success / error) is handled. Non-goals: auth, CV file upload, multi-step wizard, server email, search."

**Revision 1 (2026-10-01)**: "Add an optional 'LinkedIn profile URL' field (validated as a URL when present; not required). Change: the cover note becomes required, min 50 characters. Add acceptance criterion: the confirmation state shows the applicant's name and the role applied for."

**Design reference**: `Design/Job Application Page.dc.html` (desktop/tablet) and
`Design/Job Application Mobile.dc.html` (mobile). The design defines layout and copy. This spec
defines behaviour. Where this spec departs from the design, the departure is listed under
**Design deviations** in Assumptions.

## Clarifications

### Session 2026-10-01

- Q: The design has a required CV file picker, but CV upload is out of scope. What should the CV
  field do? → A: Keep the designed required picker (choose a file or drag one in, PDF/DOC/DOCX up
  to 10MB), and record only the file's name and size. No file is uploaded or stored.
- Q: The design's confirmation says "We've sent a copy to {email}", but no email is ever sent. What
  should that line say? → A: Replace it with "We'll contact you at {email}."
- Q: The plan puts the form and the confirmation on separate pages (`/apply` and `/confirmation`).
  What does a reload show? → A: Reloading the confirmation page shows the most recent saved
  application again. Opening or reloading the form page always shows the default form, so that
  "Start again" works.
- Q: The plan's data shape includes `phone`, but the form has no phone field. Is phone collected?
  → A: No. The data shape is matched to the form on the page: there is no phone field, and the
  LinkedIn URL and CV details are added.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply for the advertised role (Priority: P1)

A candidate opens the job page for "Senior .NET Engineer (Remote, UK)" at Northgate Labs. They read
the role details and fill in the application form: full name, email address, CV, a cover note, and
optionally their LinkedIn profile URL. Then they send it. The form is replaced by a confirmation
that thanks them by name, names the role they applied for, and says what happens next.

**Why this priority**: Submitting an application is the reason the screen exists. Without it there
is no product.

**Independent Test**: Open the job page, fill in valid details, select "Send application", and
confirm that the confirmation state appears with the candidate's name and the role title.

**Acceptance Scenarios**:

1. **Given** the job page is open and the form is empty (default state), **When** the candidate
   looks at the form, **Then** they see the role header, the role facts (salary, location,
   contract, team, closing date, hiring manager), the role description, and the "Apply for this
   role" form with each field's help text and no errors showing.
2. **Given** the candidate has entered a valid full name, a valid email address, a CV and a cover
   note of at least 50 characters, with or without a LinkedIn URL, **When** they select "Send
   application", **Then** the application is sent and the form is replaced by the "Application
   sent" confirmation.
3. **Given** the confirmation is showing, **When** the candidate reads it, **Then** it shows the
   applicant's name (the greeting uses the first word of the name they entered, e.g. "Thanks
   Ravi") **and** the role applied for ("Senior .NET Engineer (Remote, UK)" at Northgate Labs), and
   it offers "Browse other roles" and "Start again".
4. **Given** the confirmation is showing, **When** the candidate selects "Start again", **Then**
   the form returns to its default state with every field empty.

---

### User Story 2 - Get told clearly what needs fixing (Priority: P1)

A candidate tries to send the form with missing or invalid details. The application is not sent.
Each problem field is highlighted, and its message explains what to fix. A summary at the top of
the form says how many things need fixing. As the candidate corrects each field, its error clears
straight away.

**Why this priority**: Validation stops incomplete applications from reaching the hiring team.
Clear, kind error messages keep candidates from giving up.

**Independent Test**: Select "Send application" on an empty form, check that the errors appear and
nothing is sent, fix each field one at a time, and confirm that each error clears as it is fixed.

**Acceptance Scenarios**:

1. **Given** the form is empty, **When** the candidate selects "Send application", **Then** nothing
   is sent, a summary alert reads "A few things need fixing before you can send this." with "Check
   the highlighted fields below.", and each required field shows its own error: "Enter your
   name.", "Enter your email address.", "Attach your CV to apply." and "Add a short cover note."
   The LinkedIn field shows no error.
2. **Given** exactly one field is invalid at submit time, **When** the candidate selects "Send
   application", **Then** the summary reads "One thing needs fixing before you can send this."
3. **Given** the email field holds an address without a valid domain (e.g. `ravi@northgate`),
   **When** the candidate tries to send, **Then** the email field shows "Add a domain, like
   name@company.com." and nothing is sent.
4. **Given** the cover note has between 1 and 49 characters (after trimming), **When** the
   candidate tries to send, **Then** the cover note shows "Tell us a little more: at least 50
   characters." and nothing is sent.
5. **Given** the LinkedIn field holds text that is not a web address (e.g. `ravi shah` or
   `linkedin`), **When** the candidate tries to send, **Then** the LinkedIn field shows "Enter a
   full web address, like https://www.linkedin.com/in/your-name." and nothing is sent.
6. **Given** the LinkedIn field is empty, **When** the candidate sends an otherwise valid form,
   **Then** the application is sent. The LinkedIn URL is not required.
7. **Given** errors are showing after a send attempt (validating state), **When** the candidate
   corrects a field, **Then** that field's error and highlight clear immediately, and the summary
   count updates or disappears without another send attempt.
8. **Given** the candidate has not yet tried to send, **When** they type into or leave a field,
   **Then** no error messages appear. Only the help text shows.
9. **Given** a field holds only whitespace, **When** the candidate tries to send, **Then** that
   field counts as empty. For the optional LinkedIn field, this means it counts as not provided.

---

### User Story 3 - Recover when sending fails (Priority: P2)

A candidate sends a valid application, but it cannot be saved. They see a clear message saying it
did not go through. Everything they entered is still there, and they can try again with one
action.

**Why this priority**: Losing an application, or silently failing, destroys trust. Retrying must
not mean typing everything again.

**Independent Test**: Make saving fail, send a valid application, confirm the failure message
appears and the entered details are kept, restore saving, retry, and confirm the confirmation
state appears.

**Acceptance Scenarios**:

1. **Given** a valid form, **When** the candidate selects "Send application", **Then** the form
   enters a submitting state: the button shows that sending is in progress, the form cannot be sent
   a second time, and the fields cannot be edited until the attempt finishes.
2. **Given** the submitting state, **When** saving fails, **Then** the form shows a visible error
   alert explaining that the application was not sent and that the candidate can try again, and
   every value they entered is kept.
3. **Given** the failure error is showing, **When** the candidate selects the retry action,
   **Then** the application is sent again with the same details, and on success the confirmation
   state appears.
4. **Given** the failure error is showing, **When** the candidate edits a field, **Then** they can
   still change their details before retrying.

---

### User Story 4 - The application is still there after a reload (Priority: P2)

A candidate sends their application and then reloads the page, or comes back later in the same
browser. Their application is still recorded, and the page shows that they have already applied
instead of an empty form.

**Why this priority**: Candidates need to trust that their application was actually received.
Losing it on reload would mean duplicate or missing applications.

**Independent Test**: Send an application, reload the page, and confirm that the confirmation
state shows the same name, role and email, and that the stored application holds every submitted
detail.

**Acceptance Scenarios**:

1. **Given** the candidate has sent an application and is looking at the confirmation, **When**
   they reload the page, **Then** the confirmation for that application appears again, showing the
   same name, role and email.
2. **Given** the candidate has sent an application and then selects "Start again", **When** they
   send a second application, **Then** both applications are kept. Starting again never deletes an
   application that was already sent.
3. **Given** the candidate filled in the form but did not send it, **When** they reload the page,
   **Then** the form returns to its default state.

---

### Edge Cases

- **Cover note length**: the cover note must have at least 50 and at most 500 characters. Leading
  and trailing spaces are trimmed before counting towards the minimum. Extra characters beyond 500,
  including pasted text, are cut off at 500. The counter reads "50 to 500 characters." when the
  note is empty and "N / 500 characters" otherwise.
- **LinkedIn URL formats**: `https://www.linkedin.com/in/ravi-shah`, `http://linkedin.com/in/ravi`
  and `www.linkedin.com/in/ravi` (no scheme) are all accepted. Text with spaces, text without a
  dot in the domain, and non-web schemes (e.g. `mailto:`) are rejected. Any well-formed web
  address is accepted. The address does not have to be on linkedin.com.
- **Double submission**: repeated clicks or Enter presses while sending create exactly one
  application.
- **Leading or trailing spaces**: these are trimmed from name, email, LinkedIn URL and cover note
  before validating and saving.
- **Single-word or multi-word names**: the confirmation greeting uses the first word of the trimmed
  name (e.g. "Ravi Shah" → "Thanks Ravi").
- **Storage unavailable** (e.g. private browsing or storage full): this is a submit failure. The
  failure error state applies, and the candidate's details are kept.
- **Narrow screens**: every state, including the error alerts and the confirmation, works without
  horizontal scrolling down to 360px wide. Long LinkedIn URLs wrap or are truncated inside the
  field and never widen the layout.
- **Keyboard and screen-reader use**: after a failed send attempt, the error summary is announced
  and focus moves to it or to the first invalid field. Each field's error is linked to that field.
  The submitting, failure and success changes are announced.
- **Removing the CV after an attempt**: if the candidate removes their CV after a send attempt, the
  CV error comes back straight away.

## Requirements *(mandatory)*

### Functional Requirements

**Presentation (default state)**

- **FR-001**: The screen MUST show the advertised role as in the design. That means the company and
  team line, the job title, the summary, the role facts (salary £78,000 – £92,000; Remote, UK;
  Permanent, full time; Platform, 9 people; applications close 29 August 2026; hiring manager Dana
  Kowalski), and the role description sections. Content MUST be the real content from the design,
  not placeholder text.
- **FR-002**: The application form MUST have these fields, in this order:
  - **Full name** (required)
  - **Email** (required)
  - **LinkedIn profile URL** (optional)
  - **CV** (required in the design, see FR-004)
  - **Cover note** (required, 50–500 characters, with a live character counter)
- **FR-003**: In the default state, each field MUST show its help text:
  - Full name: "As it appears on your CV."
  - Email: "We'll only use this about your application."
  - LinkedIn profile URL: label "LinkedIn profile URL (optional)", help text "Paste the link to
    your public profile."
  - CV: "PDF, DOC or DOCX, up to 10MB."
  - Cover note: no "(optional)" marker on the label, and the counter text "50 to 500 characters."
- **FR-004**: The CV field MUST be the designed required file picker: "Choose a file" or drag a
  file in, accepting PDF, DOC or DOCX up to 10MB. Once a file is chosen, it shows the file's name
  and size and a "Remove" action. Only the file's **name and size** are recorded. The file's
  contents are never uploaded or stored. A file with another type, or a file over 10MB, MUST be
  rejected with an inline error in the design's error pattern: "Choose a PDF, DOC or DOCX file." or
  "That file is over 10MB. Try a smaller one." With no file chosen, the error is "Attach your CV to
  apply."

**Validation (validating state)**

- **FR-005**: The system MUST validate on every send attempt. A send attempt with any invalid field
  MUST NOT send or save anything.
- **FR-006**: Full name MUST be non-empty after trimming. Error: "Enter your name."
- **FR-007**: Email MUST be non-empty after trimming. Error: "Enter your email address." It MUST
  also be in the form `local@domain.tld` (no spaces, exactly one "@", a dot in the domain part).
  Error: "Add a domain, like name@company.com."
- **FR-008**: LinkedIn profile URL is optional. When it is empty, or only whitespace, it MUST pass
  validation and is saved as not provided. When it is present, it MUST be a well-formed web
  address: an `http://` or `https://` scheme or no scheme at all, a host name containing a dot,
  and no spaces. Error: "Enter a full web address, like https://www.linkedin.com/in/your-name."
- **FR-009**: Cover note MUST be non-empty after trimming. Error: "Add a short cover note." It MUST
  also have at least 50 characters after trimming. Error: "Tell us a little more: at least 50
  characters." It MUST NOT be longer than 500 characters (input is capped at 500).
- **FR-010**: Errors MUST appear inline under the field, replacing its help text. The field MUST
  be highlighted as invalid. An error summary MUST appear at the top of the form ("One thing needs
  fixing before you can send this." or "A few things need fixing before you can send this.", plus
  "Check the highlighted fields below."). The count includes every invalid field, the LinkedIn
  field among them.
- **FR-011**: Errors MUST NOT appear before the first send attempt. After the first attempt,
  validation MUST re-run as the candidate edits, and errors MUST clear as soon as a field becomes
  valid.
- **FR-012**: "Send application" MUST stay available to select (not disabled) so that selecting it
  shows the errors. Sending is blocked by validation, not by disabling the button. This matches the
  design and keeps the reason for a blocked send discoverable.

**Submission (submitting, success and error states)**

- **FR-013**: When a valid form is sent, the system MUST enter a submitting state. The button MUST
  show that sending is in progress (e.g. "Sending…"). Further send attempts and field edits MUST be
  blocked until the attempt finishes.
- **FR-014**: The system MUST save the application before showing success. The saved application
  holds the role, the trimmed full name, the trimmed email, the trimmed LinkedIn URL or "not
  provided", the CV's file name and size, the trimmed cover note, and the submission time.
- **FR-015**: When saving succeeds, the form MUST be replaced by the "Application sent"
  confirmation. The confirmation MUST:
  - show the applicant's name (the greeting "Thanks {first name}." uses the first word of the
    trimmed full name);
  - show the role applied for, with job title and company, e.g. "Your application for Senior .NET
    Engineer (Remote, UK) at Northgate Labs is in.";
  - explain the next steps in the design's wording;
  - offer "Browse other roles" and "Start again".
- **FR-016**: The confirmation copy MUST be accurate for what the product actually does. The
  design's "We've sent a copy to {email}." MUST be replaced with "We'll contact you at {email}."
  No email is sent.
- **FR-017**: When saving fails, the system MUST leave the submitting state and show a visible
  error alert in the form, using the design's alert pattern. The alert MUST say that the
  application was not sent and that nothing they entered was lost, and it MUST offer a retry
  action. Every entered value MUST be kept.
- **FR-018**: Retrying MUST resend the current form contents. It follows the same validation,
  submitting, success and failure rules as a first send.
- **FR-019**: Each send MUST create at most one saved application, however many times the button
  is selected.

**Persistence**

- **FR-020**: Sent applications MUST survive a page reload and a browser restart on the same
  device and browser.
- **FR-021**: Reloading or reopening the confirmation MUST show the most recent saved application
  again, with its name, role and email. If no application has been saved, the candidate MUST be
  taken to the form instead. Opening the form always shows the default state.
- **FR-022**: "Start again" MUST return the form to its default state with empty fields and no
  errors. It MUST NOT delete applications that were already sent.
- **FR-023**: Values that were entered but not sent are NOT kept across a reload.

**Accessibility and layout**

- **FR-024**: Every state MUST meet WCAG AA contrast, MUST have labelled fields and a visible focus
  indicator, and MUST work at 360px width.
- **FR-025**: Changes of state (validation summary, submitting, failure, success) MUST be announced
  to assistive technology. Each field's error MUST be programmatically linked to that field.

**Out of scope**

- **FR-026**: These are out of scope:
  - candidate sign-in or accounts;
  - uploading or storing the CV file itself;
  - multi-step forms;
  - sending any email;
  - searching or filtering roles;
  - checking that a LinkedIn URL actually exists or belongs to the candidate.

  "Browse other roles" and "All open roles" are links only. The page they lead to is a separate
  feature.

### Key Entities

- **Job role**: the advertised position. It has title, company, team, summary, salary range,
  location, contract type, team size, closing date, hiring manager (name, title) and description
  sections. For this feature the role is fixed content taken from the design.
- **Application**: one candidate's submission for a role. It has a unique reference, the role it
  is for (title and company, so the confirmation can name it), full name, email, an optional
  LinkedIn profile URL, CV details (file name and size only), a required cover note of 50–500 characters, and
  when it was sent. It is created once and never edited by this feature.
- **Form state**: which state the screen is in (default, validating, submitting, success, or
  submit failure), plus the current field values and errors. It is not saved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time candidate with their details ready (including a short cover note in
  mind) can go from opening the page to seeing the confirmation in under 2 minutes.
- **SC-002**: 100% of these send attempts are blocked, and every invalid field shows its inline
  error:
  - a required field (name, email, CV, cover note) is missing;
  - the email is badly formed;
  - the cover note is shorter than 50 characters;
  - a LinkedIn URL is present but malformed.
- **SC-003**: 100% of valid applications without a LinkedIn URL can be sent. The optional field
  never blocks a send.
- **SC-004**: 100% of successfully sent applications are still present, with all submitted
  details, after a page reload and after the browser is closed and reopened.
- **SC-005**: The confirmation state, both straight after sending and after a reload, shows the
  applicant's name and the title of the role applied for in 100% of cases.
- **SC-006**: Each of the five states (default, validating, submitting, success and submit failure)
  can be reached and shown during verification. None is missing or only partly done.
- **SC-007**: After a submit failure, the candidate can retry and succeed without typing any
  detail again.
- **SC-008**: Selecting "Send application" many times quickly results in exactly one saved
  application.
- **SC-009**: Every state can be used at a 360px viewport width with no horizontal scrolling, and
  passes an AA contrast check.

## Assumptions

- **Single role**: the screen shows one fixed role ("Senior .NET Engineer (Remote, UK)" at
  Northgate Labs), with content taken from the design. Loading roles from a catalogue belongs to a
  later feature.
- **Storage on the device**: "persist" means saved in the candidate's own browser on their device.
  There is no server or account (sign-in is a non-goal). So an application is only "remembered" on
  the same device and browser.
- **Applicant's name on the confirmation**: the greeting uses the first name, as the design does.
  This satisfies "shows the applicant's name". The role line uses the job title and company.
- **LinkedIn URL**: following the request ("validated as a URL"), any well-formed web address is
  accepted. Requiring a linkedin.com address would be stricter than what was asked.
- **Design deviations** (Principle I: these must be documented and built faithfully in the
  design's style):
  1. **LinkedIn profile URL field**: not in the design. It is added as a standard text input
     between Email and CV, with the design's input, label, help text and error patterns. On wide
     screens the Name/Email pair layout is unchanged, and LinkedIn takes a full-width row.
  2. **Cover note is required**: the design labels it "(optional)". The marker is removed, the
     counter copy changes to "50 to 500 characters.", and errors use the design's inline error
     pattern.
  3. **Confirmation names the role**: the design's confirmation does not mention the role. A line
     naming the job title and company is added in the design's body-text style.
  4. **Submitting and failure states**: the design shows default, validating and success, but has
     no frames for submitting or submit failure. These are built from the existing patterns: the
     in-progress button label, and the same alert pattern as the validation summary.
- **New copy**, written in the design's voice:
  - cover note errors: "Add a short cover note." and "Tell us a little more: at least 50
    characters.";
  - LinkedIn help text and error (see FR-003 and FR-008);
  - confirmation role line (FR-015);
  - failure alert: title "We couldn't send your application.", body "Nothing you entered has been
    lost. Please try again in a moment.", action "Try again".
- **Demonstrating failure**: there is a way to make saving fail on purpose during verification, so
  that the failure and retry flow can be checked.
- **"Takes about five minutes"**: the design's intro line is kept as written. The 2-minute target
  (SC-001) assumes the candidate has their details ready.
- **Dates in the content**: the closing date (29 August 2026) and the reply date in the
  confirmation (5 September) are shown as written in the design. Closing the form once the role has
  closed is out of scope for this feature.
- **Mobile layout**: `Design/Job Application Mobile.dc.html` defines the narrow-screen layout. The
  behaviour is the same at every width.
