import { ApplicationDraft } from '../models/application-draft';
import { ApplicationErrors } from '../models/application-errors';
import { CvFile } from '../models/cv-file';

// Rules and copy: specs/001-job-application-form/data-model.md ("Validation rules").
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const CV_EXTENSIONS = ['pdf', 'doc', 'docx'];
const CV_MAX_BYTES = 10 * 1024 * 1024;
const COVER_NOTE_MIN = 50;
const COVER_NOTE_MAX = 500;

export const MESSAGES = {
  nameRequired: 'Enter your name.',
  emailRequired: 'Enter your email address.',
  emailFormat: 'Add a domain, like name@company.com.',
  linkedInFormat: 'Enter a full web address, like https://www.linkedin.com/in/your-name.',
  cvRequired: 'Attach your CV to apply.',
  cvType: 'Choose a PDF, DOC or DOCX file.',
  cvSize: 'That file is over 10MB. Try a smaller one.',
  coverNoteRequired: 'Add a short cover note.',
  coverNoteMin: 'Tell us a little more: at least 50 characters.',
  coverNoteMax: 'Keep your cover note to 500 characters or fewer.',
} as const;

/** Validates the whole draft; each field gets at most its first failing rule. */
export function validateApplication(draft: ApplicationDraft): ApplicationErrors {
  const errors: ApplicationErrors = {};

  const fullName = draft.fullName.trim();
  if (!fullName) {
    errors.fullName = MESSAGES.nameRequired;
  }

  const email = draft.email.trim();
  if (!email) {
    errors.email = MESSAGES.emailRequired;
  } else if (!EMAIL.test(email)) {
    errors.email = MESSAGES.emailFormat;
  }

  const linkedInUrl = draft.linkedInUrl.trim();
  if (linkedInUrl && !isWebAddress(linkedInUrl)) {
    errors.linkedInUrl = MESSAGES.linkedInFormat;
  }

  const cvError = draft.cv ? validateCvFile(draft.cv) : MESSAGES.cvRequired;
  if (cvError) {
    errors.cv = cvError;
  }

  const coverNote = draft.coverNote.trim();
  if (!coverNote) {
    errors.coverNote = MESSAGES.coverNoteRequired;
  } else if (coverNote.length < COVER_NOTE_MIN) {
    errors.coverNote = MESSAGES.coverNoteMin;
  } else if (draft.coverNote.length > COVER_NOTE_MAX) {
    errors.coverNote = MESSAGES.coverNoteMax;
  }

  return errors;
}

/** File type, then size. Used on its own as soon as a file is chosen (spec FR-004, FR-011). */
export function validateCvFile(file: CvFile): string | null {
  const parts = file.fileName.split('.');
  const extension = parts.length > 1 ? (parts.pop() ?? '').toLowerCase() : '';
  if (!CV_EXTENSIONS.includes(extension)) {
    return MESSAGES.cvType;
  }
  if (file.sizeBytes > CV_MAX_BYTES) {
    return MESSAGES.cvSize;
  }
  return null;
}

export function errorSummary(count: number): string {
  return count === 1
    ? 'One thing needs fixing before you can send this.'
    : 'A few things need fixing before you can send this.';
}

/** Optional http(s) scheme, a host containing a dot, and no spaces. */
function isWebAddress(value: string): boolean {
  if (/\s/.test(value)) {
    return false;
  }
  const candidate = HAS_SCHEME.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}
