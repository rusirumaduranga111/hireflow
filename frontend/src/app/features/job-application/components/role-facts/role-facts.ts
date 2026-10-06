import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from '../../../../shared/ui/card/card';
import { JobRole } from '../../models/job-role';

@Component({
  selector: 'hf-role-facts',
  imports: [Card],
  templateUrl: './role-facts.html',
  styleUrl: './role-facts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleFacts {
  readonly role = input.required<JobRole>();
}
