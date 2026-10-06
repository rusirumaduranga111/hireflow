import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Shared button, applied to a native `<button>` or `<a>` so semantics stay native. */
@Component({
  selector: 'button[hf-button], a[hf-button]',
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hf-button',
    '[class.hf-button--primary]': "variant() === 'primary'",
    '[class.hf-button--secondary]': "variant() === 'secondary'",
    '[class.hf-button--quiet]': "variant() === 'quiet'",
    '[class.hf-button--sm]': "size() === 'sm'",
    '[class.hf-button--lg]': "size() === 'lg'",
    '[class.hf-button--full]': 'fullWidth()',
    '[class.hf-button--busy]': 'busy()',
    '[attr.aria-disabled]': "busy() ? 'true' : null",
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly busy = input(false);
  readonly fullWidth = input(false);
}
