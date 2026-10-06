import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JobRole } from '../../models/job-role';
import { RoleDescription } from '../role-description/role-description';
import { RoleFacts } from '../role-facts/role-facts';
import { RoleHeader } from '../role-header/role-header';

/**
 * The job page layout shared by /apply and /confirmation: header, facts, description,
 * then the projected action area (the form, or the confirmation that replaces it).
 * Wireframe 1a on narrow screens, 2b (sticky facts column) at the wide breakpoint.
 */
@Component({
  selector: 'hf-role-page-layout',
  imports: [RoleHeader, RoleFacts, RoleDescription],
  templateUrl: './role-page-layout.html',
  styleUrl: './role-page-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePageLayout {
  readonly role = input.required<JobRole>();
}
