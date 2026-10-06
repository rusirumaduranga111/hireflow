import { CvFile } from './cv-file';

/** A sent application, as stored in the "applications" array. Created once, never edited. */
export interface JobApplication {
  readonly id: string;
  readonly roleId: string;
  readonly jobTitle: string;
  readonly company: string;
  readonly fullName: string;
  readonly email: string;
  readonly linkedInUrl: string | null;
  readonly cv: CvFile;
  readonly coverNote: string;
  /** ISO 8601 timestamp. */
  readonly submittedAt: string;
}
