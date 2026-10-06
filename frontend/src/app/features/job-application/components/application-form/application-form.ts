import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { Card } from '../../../../shared/ui/card/card';
import { TextInput } from '../../../../shared/ui/text-input/text-input';
import { ApplicationDraft } from '../../models/application-draft';
import { ApplicationErrors, ApplicationField } from '../../models/application-errors';
import { CvFile } from '../../models/cv-file';
import { FormStatus } from '../../models/form-state';
import { JobRole } from '../../models/job-role';
import { CvPicker } from '../cv-picker/cv-picker';

export type TextField = Exclude<ApplicationField, 'cv'>;

export interface FieldChange {
  readonly field: TextField;
  readonly value: string;
}

const COVER_NOTE_MAX = 500;

/** Presentational application form: data in through inputs, intent out through outputs. */
@Component({
  selector: 'hf-application-form',
  imports: [Button, Card, TextInput, CvPicker],
  templateUrl: './application-form.html',
  styleUrl: './application-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationForm {
  readonly role = input.required<JobRole>();
  readonly draft = input.required<ApplicationDraft>();
  readonly errors = input<ApplicationErrors>({});
  readonly status = input<FormStatus>('editing');

  readonly fieldChange = output<FieldChange>();
  readonly cvChange = output<CvFile | null>();
  readonly send = output<void>();

  protected readonly coverNoteMax = COVER_NOTE_MAX;
  protected readonly busy = computed(() => this.status() === 'submitting');
  protected readonly hiringManagerFirstName = computed(
    () => this.role().facts.hiringManager.name.split(' ')[0],
  );
  protected readonly coverNoteCount = computed(() => {
    const length = this.draft().coverNote.length;
    return length === 0 ? '50 to 500 characters.' : `${length} / ${COVER_NOTE_MAX} characters`;
  });

  protected change(field: TextField, value: string): void {
    this.fieldChange.emit({
      field,
      value: field === 'coverNote' ? value.slice(0, COVER_NOTE_MAX) : value,
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.busy()) {
      this.send.emit();
    }
  }
}
