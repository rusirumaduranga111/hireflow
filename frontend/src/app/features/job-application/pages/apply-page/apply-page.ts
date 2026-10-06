import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  computed,
  inject,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationForm, FieldChange } from '../../components/application-form/application-form';
import { FormAlert } from '../../components/form-alert/form-alert';
import { RolePageLayout } from '../../components/role-page-layout/role-page-layout';
import { SENIOR_DOTNET_ENGINEER } from '../../data/senior-dotnet-engineer';
import { ApplicationDraft, EMPTY_DRAFT } from '../../models/application-draft';
import { ApplicationErrors } from '../../models/application-errors';
import { CvFile } from '../../models/cv-file';
import { FormStatus } from '../../models/form-state';
import { ApplicationService } from '../../services/application.service';
import { SAVE_FAILURE_SIMULATION } from '../../services/application.tokens';
import {
  errorSummary,
  validateApplication,
  validateCvFile,
} from '../../validation/application-validation';
import { nextOnSend } from '../../validation/form-transitions';

/** Smart page for /apply: owns the draft, validation state and the send flow. */
@Component({
  selector: 'hf-apply-page',
  imports: [RolePageLayout, ApplicationForm, FormAlert],
  templateUrl: './apply-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyPage {
  readonly #applications = inject(ApplicationService);
  readonly #router = inject(Router);
  readonly #injector = inject(Injector);
  private readonly alert = viewChild(FormAlert);

  protected readonly role = SENIOR_DOTNET_ENGINEER;
  protected readonly draft = signal<ApplicationDraft>(EMPTY_DRAFT);
  protected readonly attempted = signal(false);
  protected readonly status = signal<FormStatus>('editing');

  /**
   * No errors before the first send attempt, then live revalidation (FR-011).
   * Exception: an unsuitable CV file is flagged as soon as it is chosen.
   */
  protected readonly errors = computed<ApplicationErrors>(() => {
    const draft = this.draft();
    if (this.attempted()) {
      return validateApplication(draft);
    }
    const cvError = draft.cv ? validateCvFile(draft.cv) : null;
    return cvError ? { cv: cvError } : {};
  });
  protected readonly errorCount = computed(() => Object.keys(this.errors()).length);
  protected readonly showSummary = computed(
    () => this.attempted() && this.errorCount() > 0 && this.status() !== 'failed',
  );
  protected readonly summaryTitle = computed(() => errorSummary(this.errorCount()));

  constructor() {
    // Dev-only: /apply?simulateFailure=once makes the next save fail (research R7).
    const simulate = inject(ActivatedRoute).snapshot.queryParamMap.get('simulateFailure');
    if (isDevMode() && simulate === 'once') {
      inject(SAVE_FAILURE_SIMULATION).arm();
    }
  }

  protected onFieldChange({ field, value }: FieldChange): void {
    if (this.status() !== 'submitting') {
      this.draft.update((draft) => ({ ...draft, [field]: value }));
    }
  }

  protected onCvChange(cv: CvFile | null): void {
    if (this.status() !== 'submitting') {
      this.draft.update((draft) => ({ ...draft, cv }));
    }
  }

  protected async onSend(): Promise<void> {
    const decision = nextOnSend(
      { attempted: this.attempted(), status: this.status() },
      validateApplication(this.draft()),
    );
    if (decision === 'ignore') {
      return;
    }

    this.attempted.set(true);
    if (decision === 'blocked') {
      // A new attempt replaces any earlier failure alert with the validation summary.
      this.status.set('editing');
      this.#focusAlert();
      return;
    }

    this.status.set('submitting');
    try {
      await this.#applications.submit(this.role, this.draft());
    } catch {
      this.status.set('failed');
      this.#focusAlert();
      return;
    }
    await this.#router.navigate(['/confirmation'], { replaceUrl: true });
  }

  #focusAlert(): void {
    afterNextRender(() => this.alert()?.focus(), { injector: this.#injector });
  }
}
