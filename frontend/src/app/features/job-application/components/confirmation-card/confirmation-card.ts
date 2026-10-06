import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../../shared/ui/button/button';
import { Card } from '../../../../shared/ui/card/card';
import { JobApplication } from '../../models/job-application';
import { JobRole } from '../../models/job-role';

@Component({
  selector: 'hf-confirmation-card',
  imports: [Button, Card, RouterLink],
  templateUrl: './confirmation-card.html',
  styleUrl: './confirmation-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationCard {
  readonly application = input.required<JobApplication>();
  readonly role = input.required<JobRole>();
  readonly startAgain = output<void>();

  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  protected readonly firstName = computed(
    () => this.application().fullName.trim().split(/\s+/)[0] || 'there',
  );
  protected readonly hiringManagerFirstName = computed(
    () => this.role().facts.hiringManager.name.split(' ')[0],
  );

  focusHeading(): void {
    this.heading().nativeElement.focus();
  }
}
