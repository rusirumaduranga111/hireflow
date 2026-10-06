import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';

/** Error alert used for the validation summary and the submit failure (design lines 105–110). */
@Component({
  selector: 'hf-form-alert',
  imports: [Button],
  templateUrl: './form-alert.html',
  styleUrl: './form-alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAlert {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  focus(): void {
    this.#host.nativeElement.querySelector<HTMLElement>('[role="alert"]')?.focus();
  }
}
