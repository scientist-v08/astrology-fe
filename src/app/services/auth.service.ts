import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable, shareReplay, Subject, Subscription, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    access_token_expires_at: string;
    refresh_token_expires_at: string;
    username: string;
    full_name: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private refreshSubscription: Subscription | null = null;
    private refreshRequest$: Observable<AuthResponse> | null = null;
    private http = inject(HttpClient);
    private router = inject(Router);
    loggedIn = new Subject<number | null>();
    loggedIn$ = this.loggedIn.asObservable();
    isLoggingOut = signal<boolean>(false);
    url = environment.BASEURLLOGIN;

    login(credentials: { username: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.url + 'login', credentials).pipe(
            tap((response: AuthResponse) => {
                this.storeTokens(response);
                this.isLoggingOut.set(false);
            }),
            catchError((err) => {
                this.clearTokens();
                return throwError(() => err);
            }),
        );
    }

    /** Ensures only one refresh HTTP call is in-flight at a time (prevents token rotation races). */
    refreshTokens(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        if (!this.refreshRequest$) {
            this.refreshRequest$ = this.http
                .post<AuthResponse>(this.url + 'refresh', { refresh_token: refreshToken })
                .pipe(
                    tap((response: AuthResponse) => {
                        this.storeTokens(response);
                        this.isLoggingOut.set(false);
                    }),
                    catchError((err) => throwError(() => err)),
                    finalize(() => {
                        this.refreshRequest$ = null;
                    }),
                    shareReplay({ bufferSize: 1, refCount: true }),
                );
        }

        return this.refreshRequest$;
    }

    logout(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
            this.refreshSubscription = null;
        }
        this.refreshRequest$ = null;
        this.isLoggingOut.set(true);
        this.clearTokens();
        this.loggedIn.next(null);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('logged_in') === 'true' && !!this.getRefreshToken();
    }

    isAccessTokenExpiringSoon(bufferMs = 60_000): boolean {
        const expiresAt = localStorage.getItem('access_token_expires_at');
        if (!expiresAt) {
            return true;
        }
        return new Date(expiresAt).getTime() - Date.now() <= bufferMs;
    }

    storeTokens(response: AuthResponse): void {
        localStorage.setItem('access_token', response?.access_token ?? '');
        localStorage.setItem('refresh_token', response?.refresh_token ?? '');
        localStorage.setItem('access_token_expires_at', response?.access_token_expires_at ?? '');
        localStorage.setItem('refresh_token_expires_at', response?.refresh_token_expires_at ?? '');
        localStorage.setItem('logged_in', 'true');
    }

    private getRefreshToken(): string {
        return localStorage.getItem('refresh_token') || '';
    }

    private clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token_expires_at');
        localStorage.removeItem('refresh_token_expires_at');
        localStorage.removeItem('logged_in');
    }
}