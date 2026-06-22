import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const RETRY_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

function isAuthEndpoint(url: string): boolean {
    return url.includes('/login') || url.includes('/refresh');
}

function withAccessToken(req: Parameters<HttpInterceptorFn>[0]) {
    const authToken = localStorage.getItem('access_token');
    if (!authToken) {
        return req;
    }
    return req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` },
    });
}

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (isAuthEndpoint(req.url)) {
        return next(req);
    }

    return next(withAccessToken(req)).pipe(
        catchError((err: HttpErrorResponse) => {
            const alreadyRetried = req.context.get(RETRY_AFTER_REFRESH);

            if (err.status !== 401 || authService.isLoggingOut() || alreadyRetried) {
                if (err.status === 401 && !authService.isLoggingOut() && alreadyRetried) {
                    authService.logout();
                }
                return throwError(() => err);
            }

            return authService.refreshTokens().pipe(
                switchMap(() =>
                    next(
                        withAccessToken(
                            req.clone({
                                context: req.context.set(RETRY_AFTER_REFRESH, true),
                            }),
                        ),
                    ),
                ),
                catchError((refreshErr) => {
                    authService.logout();
                    return throwError(() => refreshErr);
                }),
            );
        }),
    );
};