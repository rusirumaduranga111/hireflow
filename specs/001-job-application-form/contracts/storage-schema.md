# Contract: localStorage schema

**Key**: `applications`
**Value**: a JSON array of `JobApplication`. It is appended to only, and the newest record is
last.

```json
[
  {
    "id": "6f1c2a9e-3b7d-4e0a-9c55-2d8f1b7e4a10",
    "roleId": "senior-dotnet-engineer",
    "jobTitle": "Senior .NET Engineer (Remote, UK)",
    "company": "Northgate Labs",
    "fullName": "Ravi Shah",
    "email": "ravi.shah@fastmail.co.uk",
    "linkedInUrl": "https://www.linkedin.com/in/ravi-shah-dotnet",
    "cv": { "fileName": "Ravi-Shah-CV-2026.pdf", "sizeBytes": 248312 },
    "coverNote": "I've spent six years on .NET services in clinical scheduling, most recently leading the move of our booking engine off a 2016 monolith.",
    "submittedAt": "2026-10-01T09:42:17.204Z"
  }
]
```

The example record is made-up sample data, not a real person.

## Shape check (`isJobApplicationArray`)

The value is valid only if it is an array, and every element has:

- `id`, `roleId`, `jobTitle`, `company`, `fullName`, `email`, `coverNote` and `submittedAt`
  as non-empty strings;
- `linkedInUrl` as a string or `null`;
- `cv` as an object with a string `fileName` and a non-negative number `sizeBytes`.

Extra properties are allowed, so later versions can add fields. Anything else counts as
**unreadable**. In that case:

- `ApplicationService.submit` rejects and does not write;
- `latest` is `null`, so `/confirmation` redirects to `/apply`.

## Compatibility

There is no version field yet. A future breaking change MUST either migrate the data or move to a
new key (e.g. `applications.v2`). It MUST NOT change the meaning of `applications` in place.
