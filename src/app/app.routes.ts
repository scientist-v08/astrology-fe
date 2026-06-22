import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { NotFoundComponent } from './main/notfound/notfound';

const canActivateLoggedIn: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const router = inject(Router);
    if (localStorage.getItem('logged_in') === 'true') {
        return true;
    }
    return router.createUrlTree(['']);
};

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./layout/login') },
    {
        path: 'astrology',
        loadComponent: () => import('./layout/main-content'),
        children: [
            { path: 'houses', loadComponent: () => import('./main/houses/houses.component') },
            {
                path: 'upagrahas',
                loadComponent: () => import('./main/upagrahas/upagrahas.component'),
            },
            {
                path: 'bnk',
                loadComponent: () =>
                    import('./main/balasAndKarakatvas/balasAndKarakatvas.component'),
            },
            {
                path: 'pairing',
                loadComponent: () => import('./main/pairMatching/pairMatching.component'),
            },
        ],
        canActivate: [canActivateLoggedIn],
    },
    { path: '**', component: NotFoundComponent },
];
