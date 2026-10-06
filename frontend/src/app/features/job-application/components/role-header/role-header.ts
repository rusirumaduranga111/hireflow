import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JobRole } from '../../models/job-role';

@Component({
  selector: 'hf-role-header',
  templateUrl: './role-header.html',
  styleUrl: './role-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleHeader {
  readonly role = input.required<JobRole>();
}
