import { Routes } from '@angular/router';
import { hasApplicationGuard } from './guards/has-application-guard';

export const JOB_APPLICATION_ROUTES: Routes = [
  {
    path: 'apply',
    title: 'Apply: Senior .NET Engineer · Northgate Labs',
    loadComponent: () => import('./pages/apply-page/apply-page').then((m) => m.ApplyPage),
  },
  {
    path: 'confirmation',
    title: 'Application sent · Northgate Labs',
    canActivate: [hasApplicationGuard],
    loadComponent: () =>
      import('./pages/confirmation-page/confirmation-page').then((m) => m.ConfirmationPage),
  },
];
