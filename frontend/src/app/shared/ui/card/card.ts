import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shared card surface, applied to the semantic element the consumer chooses. */
@Component({
  selector: 'section[hf-card], aside[hf-card], div[hf-card]',
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hf-card',
    '[class.hf-card--emphasis]': 'emphasis()',
  },
})
export class Card {
  readonly emphasis = input(false);
}
