import type { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'grid-modules-matrix',
        pathMatch: 'full',
    },
    {
        path: 'grid',
        loadChildren: () => import('./grid-wrapper/grid-wrapper.auto').then((m) => m.GridWrapperComponent),
    },
];
