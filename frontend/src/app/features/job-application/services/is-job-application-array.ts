import { JobApplication } from '../models/job-application';

const REQUIRED_STRINGS = [
  'id',
  'roleId',
  'jobTitle',
  'company',
  'fullName',
  'email',
  'coverNote',
  'submittedAt',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJobApplication(value: unknown): value is JobApplication {
  if (!isRecord(value)) {
    return false;
  }
  const hasStrings = REQUIRED_STRINGS.every(
    (key) => typeof value[key] === 'string' && value[key] !== '',
  );
  const linkedIn = value['linkedInUrl'];
  const cv = value['cv'];
  return (
    hasStrings &&
    (linkedIn === null || typeof linkedIn === 'string') &&
    isRecord(cv) &&
    typeof cv['fileName'] === 'string' &&
    typeof cv['sizeBytes'] === 'number' &&
    cv['sizeBytes'] >= 0
  );
}

/** Shape check for the "applications" key (contracts/storage-schema.md). Extra properties are allowed. */
export function isJobApplicationArray(value: unknown): value is JobApplication[] {
  return Array.isArray(value) && value.every(isJobApplication);
}
