export type FormStatus = 'editing' | 'submitting' | 'failed';

export interface FormState {
  /** True once the candidate has tried to send at least once. */
  readonly attempted: boolean;
  readonly status: FormStatus;
}
