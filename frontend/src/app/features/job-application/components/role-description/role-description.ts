import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RoleSection } from '../../models/job-role';

@Component({
  selector: 'hf-role-description',
  templateUrl: './role-description.html',
  styleUrl: './role-description.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDescription {
  readonly sections = input.required<readonly RoleSection[]>();
}
