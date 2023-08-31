import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { Page404Component } from './pages/page404/page404.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
    {
        path: 'account',
        loadChildren: () =>
            import('./pages/account/account-routing.module').then(
                (m) => m.AccountRoutingModule
            ),
    },
    {
        path: '',
        component: LayoutComponent,
        loadChildren: () =>
            import('./pages/pages.module').then((m) => m.PagesModule),
        canActivate: [authGuard],
    },
    { path: '**', component: Page404Component },
];
