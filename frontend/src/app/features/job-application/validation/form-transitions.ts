import { ApplicationErrors } from '../models/application-errors';
import { FormState } from '../models/form-state';

export type SendDecision = 'blocked' | 'submit' | 'ignore';

/** What a send attempt should do in the current state (data-model.md, form state machine). */
export function nextOnSend(state: FormState, errors: ApplicationErrors): SendDecision {
  if (state.status === 'submitting') {
    return 'ignore';
  }
  return Object.keys(errors).length > 0 ? 'blocked' : 'submit';
}
