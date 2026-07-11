import { Routes } from '@angular/router';

// lazy loaded so the first load stays gamay
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'hex' },
  {
    path: 'hex',
    title: 'The Hex',
    loadComponent: () => import('./pages/hex/hex').then((m) => m.Hex),
  },
  { path: '**', redirectTo: 'hex' },
];
