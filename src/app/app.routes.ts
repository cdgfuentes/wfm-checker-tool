import { Routes } from '@angular/router';

// lazy loaded so the first load stays gamay
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'augments' },
  {
    path: 'augments',
    title: 'Augments',
    loadComponent: () => import('./pages/augments/augments').then((m) => m.Augments),
  },
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
  { path: '**', redirectTo: 'augments' },
];
