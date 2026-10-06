import { Injectable, inject, signal } from '@angular/core';
import { StorageError } from '../../../core/storage/storage-error';
import { StorageService } from '../../../core/storage/storage.service';
import { ApplicationDraft } from '../models/application-draft';
import { JobApplication } from '../models/job-application';
import { JobRole } from '../models/job-role';
import { SAVE_FAILURE_SIMULATION, SUBMIT_LATENCY_MS } from './application.tokens';
import { isJobApplicationArray } from './is-job-application-array';

const STORAGE_KEY = 'applications';

/** Owns the "applications" storage key (contracts/services.md). */
@Injectable({ providedIn: 'root' })
export class ApplicationService {
  readonly #storage = inject(StorageService);
  readonly #latencyMs = inject(SUBMIT_LATENCY_MS);
  readonly #failureSimulation = inject(SAVE_FAILURE_SIMULATION);
  readonly #latest = signal<JobApplication | null>(null);

  /** The most recently saved application, or null. */
  readonly latest = this.#latest.asReadonly();

  constructor() {
    try {
      const all = this.#storage.read(STORAGE_KEY, isJobApplicationArray);
      this.#latest.set(all?.at(-1) ?? null);
    } catch {
      // Unreadable data: behave as if nothing was saved, and leave it untouched.
      this.#latest.set(null);
    }
  }

  /**
   * Saves a validated draft. Rejects with StorageError when storage can't be read or written;
   * unreadable stored data is never overwritten.
   */
  async submit(role: JobRole, draft: ApplicationDraft): Promise<JobApplication> {
    await new Promise<void>((resolve) => setTimeout(resolve, this.#latencyMs));
    if (this.#failureSimulation.consumeOnce()) {
      throw new StorageError('unavailable');
    }

    const existing = this.#storage.read(STORAGE_KEY, isJobApplicationArray) ?? [];
    const record = this.#toRecord(role, draft);
    this.#storage.write(STORAGE_KEY, [...existing, record]);

    this.#latest.set(record);
    return record;
  }

  #toRecord(role: JobRole, draft: ApplicationDraft): JobApplication {
    if (!draft.cv) {
      throw new Error('ApplicationService.submit requires a validated draft with a CV.');
    }
    return {
      id: crypto.randomUUID(),
      roleId: role.id,
      jobTitle: role.title,
      company: role.company,
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      linkedInUrl: draft.linkedInUrl.trim() || null,
      cv: { fileName: draft.cv.fileName, sizeBytes: draft.cv.sizeBytes },
      coverNote: draft.coverNote.trim(),
      submittedAt: new Date().toISOString(),
    };
  }
}
