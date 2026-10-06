import { ApplicationErrors } from '../models/application-errors';
import { FormState } from '../models/form-state';
import { nextOnSend } from './form-transitions';

const noErrors: ApplicationErrors = {};
const someErrors: ApplicationErrors = { email: 'Enter your email address.' };

describe('nextOnSend', () => {
  it.each<FormState>([
    { attempted: true, status: 'submitting' },
    { attempted: false, status: 'submitting' },
  ])('ignores sends while submitting (%o)', (state) => {
    expect(nextOnSend(state, noErrors)).toBe('ignore');
    expect(nextOnSend(state, someErrors)).toBe('ignore');
  });

  it.each<FormState>([
    { attempted: false, status: 'editing' },
    { attempted: true, status: 'failed' },
  ])('blocks a send with errors (%o)', (state) => {
    expect(nextOnSend(state, someErrors)).toBe('blocked');
  });

  it.each<FormState>([
    { attempted: false, status: 'editing' },
    { attempted: true, status: 'editing' },
    { attempted: true, status: 'failed' },
  ])('submits a valid draft (%o)', (state) => {
    expect(nextOnSend(state, noErrors)).toBe('submit');
  });
});
