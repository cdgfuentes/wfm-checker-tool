import { Routes } from '@angular/router';

// lazy loaded so the first load stays gamay
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'holdfast' },
  {
    path: 'holdfast',
    title: 'Holdfast',
    loadComponent: () => import('./pages/holdfast/holdfast').then((m) => m.Holdfast),
  },
  {
    path: 'cavia',
    title: 'Cavia',
    loadComponent: () => import('./pages/cavia/cavia').then((m) => m.Cavia),
  },
  {
    path: 'hex',
    title: 'The Hex',
    loadComponent: () => import('./pages/hex/hex').then((m) => m.Hex),
  },
  { path: '**', redirectTo: 'holdfast' },
];
