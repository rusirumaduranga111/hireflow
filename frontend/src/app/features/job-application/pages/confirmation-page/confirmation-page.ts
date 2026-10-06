import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationCard } from '../../components/confirmation-card/confirmation-card';
import { RolePageLayout } from '../../components/role-page-layout/role-page-layout';
import { SENIOR_DOTNET_ENGINEER } from '../../data/senior-dotnet-engineer';
import { ApplicationService } from '../../services/application.service';

/** Smart page for /confirmation: rebuilt from the latest saved application, so it survives reloads. */
@Component({
  selector: 'hf-confirmation-page',
  imports: [RolePageLayout, ConfirmationCard],
  templateUrl: './confirmation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPage {
  readonly #router = inject(Router);
  private readonly card = viewChild(ConfirmationCard);

  protected readonly role = SENIOR_DOTNET_ENGINEER;
  protected readonly application = inject(ApplicationService).latest;

  constructor() {
    afterNextRender(() => this.card()?.focusHeading());
  }

  protected startAgain(): void {
    void this.#router.navigate(['/apply']);
  }
}
