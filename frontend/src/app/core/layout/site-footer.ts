import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(content): destinations for "Privacy" and "Accessibility" are an open question
// (specs/001-job-application-form/contracts/routes-and-states.md).
@Component({
  selector: 'hf-site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {}
