import { CvFile } from './cv-file';

/** What the candidate has entered so far. Never persisted. */
export interface ApplicationDraft {
  readonly fullName: string;
  readonly email: string;
  readonly linkedInUrl: string;
  readonly cv: CvFile | null;
  readonly coverNote: string;
}

export const EMPTY_DRAFT: ApplicationDraft = {
  fullName: '',
  email: '',
  linkedInUrl: '',
  cv: null,
  coverNote: '',
};
