import { InjectionToken } from '@angular/core';

/** Delay before saving, so the submitting state is perceivable (research R7). */
export const SUBMIT_LATENCY_MS = new InjectionToken<number>('SUBMIT_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 600,
});

/** Dev-only switch that makes the next save fail once (research R7). */
export interface SaveFailureSimulation {
  arm(): void;
  consumeOnce(): boolean;
}

export const SAVE_FAILURE_SIMULATION = new InjectionToken<SaveFailureSimulation>(
  'SAVE_FAILURE_SIMULATION',
  {
    providedIn: 'root',
    factory: () => {
      let armed = false;
      return {
        arm: () => {
          armed = true;
        },
        consumeOnce: () => {
          const wasArmed = armed;
          armed = false;
          return wasArmed;
        },
      };
    },
  },
);
