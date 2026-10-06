import { Routes } from '@angular/router';
import { JOB_APPLICATION_ROUTES } from './features/job-application/job-application.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'apply' },
  ...JOB_APPLICATION_ROUTES,
  { path: '**', redirectTo: 'apply' },
];
