import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { of, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: ` <router-outlet /> `,
})
export class App implements OnInit, OnDestroy {
    authService = inject(AuthService);
    private readonly refreshIntervalMs = 14 * 60 * 1000;
    private readonly unsubscribe$ = new Subject<void>();
    private readonly onVisibilityChange = () => this.handleTabVisible();

    ngOnInit(): void {
        if (this.authService.isLoggedIn()) {
            this.authService.loggedIn.next(1);
        }

        this.authService.loggedIn$
            .pipe(
                switchMap((res: number | null) => {
                    if (res) {
                        return timer(this.refreshIntervalMs, this.refreshIntervalMs).pipe(
                            switchMap(() => this.authService.refreshTokens()),
                        );
                    }
                    return of(null);
                }),
                takeUntil(this.unsubscribe$),
            )
            .subscribe({
                error: () => {
                    console.warn('Scheduled token refresh failed');
                },
            });

        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    ngOnDestroy(): void {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    /** Browsers throttle timers in background tabs; refresh proactively when the tab is focused again. */
    private handleTabVisible(): void {
        if (document.visibilityState !== 'visible' || !this.authService.isLoggedIn()) {
            return;
        }

        if (this.authService.isAccessTokenExpiringSoon(2 * 60 * 1000)) {
            this.authService.refreshTokens().subscribe({
                error: () => console.warn('Token refresh on tab focus failed'),
            });
        }
    }
}