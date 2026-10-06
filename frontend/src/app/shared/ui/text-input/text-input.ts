import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

export type TextInputType = 'text' | 'email' | 'url';

let nextId = 0;

/** Shared text input: visible label, one slot shared by help text and error (style sheet §05). */
@Component({
  selector: 'hf-text-input',
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInput {
  readonly label = input.required<string>();
  readonly labelSuffix = input<string | null>(null);
  readonly hint = input('');
  readonly error = input<string | null | undefined>(null);
  readonly type = input<TextInputType>('text');
  readonly multiline = input(false);
  readonly rows = input(5);
  readonly maxLength = input<number | null>(null);
  readonly placeholder = input('');
  readonly readonly = input(false);
  readonly required = input(false);
  readonly autocomplete = input('off');
  readonly value = model('');
  readonly blurred = output<void>();

  protected readonly controlId = `hf-text-input-${nextId++}`;
  protected readonly messageId = `${this.controlId}-message`;

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
  }
}
