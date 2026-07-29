import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'anime',
    loadComponent: () => import('./pages/anime/anime-page').then((m) => m.AnimeComponent),
  },
];
