import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';

/** /confirmation needs a saved application; otherwise send the candidate to the form. */
export const hasApplicationGuard: CanActivateFn = () =>
  inject(ApplicationService).latest() ? true : inject(Router).createUrlTree(['/apply']);
