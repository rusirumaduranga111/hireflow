export type ApplicationField = 'fullName' | 'email' | 'linkedInUrl' | 'cv' | 'coverNote';

/** At most one message per field: the first rule it fails. */
export type ApplicationErrors = Partial<Record<ApplicationField, string>>;
