# Contract: Services

Types are defined in [data-model.md](../data-model.md). Both services are
`@Injectable({ providedIn: 'root' })`. No component touches `localStorage` directly.

## StorageService (`frontend/src/app/core/storage/storage.service.ts`)

This is the only code that reads or writes `localStorage`. Browser-only use is pinned (research
R1), so it needs no platform guards.

| Member | Signature | Behaviour |
|---|---|---|
| `read` | `read<T>(key: string, isValid: (value: unknown) => value is T): T \| null` | Returns `null` if the key is missing. Throws `StorageError('unreadable')` if `localStorage` throws, or if the stored value is not valid JSON or fails `isValid`. |
| `write` | `write<T>(key: string, value: T): void` | Stores `JSON.stringify(value)`. Throws `StorageError('unavailable')` on any `localStorage` exception, such as quota or blocked storage. |

- **`StorageError`**: `class StorageError extends Error { readonly reason: 'unreadable' | 'unavailable' }`.
- **Unit tests** cover: missing key → `null`; a value round-trips; invalid JSON → `unreadable`; a
  failed shape check → `unreadable`; `setItem` throwing → `unavailable`.

## ApplicationService (`frontend/src/app/features/job-application/services/application.service.ts`)

This service owns the `"applications"` storage key.

| Member | Signature | Behaviour |
|---|---|---|
| `latest` | `readonly latest: Signal<JobApplication \| null>` | The last saved application. It is set from storage when the service is created, and updated after each successful `submit`. If the stored data is unreadable, it is `null`. |
| `submit` | `submit(role: JobRole, draft: ApplicationDraft): Promise<JobApplication>` | Waits `SUBMIT_LATENCY_MS`. Then it reads the array again from storage. It builds the record (id, trimmed fields, `linkedInUrl` set to `null` when empty, `submittedAt`), appends it, and writes the array back. On success it updates `latest` and resolves with the record. It rejects with `StorageError` if the read or write fails. **It never overwrites unreadable data.** |

- **Precondition**: callers validate the draft first, with `validateApplication`. `submit` does
  not validate again. It only trims and normalises.
- **Injection tokens**, both in the feature's `services/` folder:
  - `SUBMIT_LATENCY_MS: InjectionToken<number>`. The default factory returns `600`. Tests provide
    `0`.
  - `SAVE_FAILURE_SIMULATION: InjectionToken<{ consumeOnce(): boolean }>`. The default is a no-op.
    In dev mode, `ApplyPage` turns it on when the URL has `?simulateFailure=once`. If
    `consumeOnce()` returns `true`, `submit` rejects with `StorageError('unavailable')` before it
    writes anything (research R7).
- **Unit tests** cover:
  - submit appends to an existing array and keeps earlier records;
  - submit trims fields and stores `null` for an empty LinkedIn URL;
  - `latest` reflects the new record;
  - a write failure rejects, and `latest` is unchanged;
  - unreadable stored data rejects, and the stored data is left byte-for-byte unchanged;
  - simulated failure rejects once, and the next call succeeds;
  - `latest` is loaded from existing storage when the service is created.

## Pure functions (`frontend/src/app/features/job-application/validation/`)

| Function | Signature | Notes |
|---|---|---|
| `validateApplication` | `(draft: ApplicationDraft) => ApplicationErrors` | The rules and copy are in data-model.md. |
| `validateCvFile` | `(file: CvFile) => string \| null` | Type and size check, used when a file is chosen. |
| `errorSummary` | `(count: number) => string` | The copy for 1 error, or for more than one. |
| `nextOnSend` | `(state: FormState, errors: ApplicationErrors) => 'blocked' \| 'submit' \| 'ignore'` | `'ignore'` while submitting. |

Every function has unit tests covering each rule and boundary: whitespace only; 49, 50 and 500
characters; the LinkedIn formats listed in the spec's edge cases; 10MB exactly and 10MB + 1 byte;
upper-case file extensions.
