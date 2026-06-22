import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { AuthResponse, AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login-svg',
    template: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="3rem"
            viewBox="0 -960 960 960"
            width="3rem"
            fill="white"
        >
            <path
                d="M240-100q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 22-6.5 42.5T354-159v-27q30 13 62 19.5t64 6.5q134 0 227-93t93-227h80q0 83-31.5 156T763-197q-54 54-127 85.5T480-80q-45 0-88-9.5T309-118q-16 9-33.5 13.5T240-100Zm42.5-97.5Q300-215 300-240t-17.5-42.5Q265-300 240-300t-42.5 17.5Q180-265 180-240t17.5 42.5Q215-180 240-180t42.5-17.5ZM480-340q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41ZM80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q45 0 88 9.5t83 28.5q16-9 33.5-13.5T720-860q58 0 99 41t41 99q0 58-41 99t-99 41q-58 0-99-41t-41-99q0-22 6.5-42.5T606-801v27q-30-13-62-19.5t-64-6.5q-134 0-227 93t-93 227H80Zm640-180q25 0 42.5-17.5T780-720q0-25-17.5-42.5T720-780q-25 0-42.5 17.5T660-720q0 25 17.5 42.5T720-660ZM240-240Zm480-480Z"
            />
        </svg>
    `,
    host: {
        class: 'contents',
    },
})
export class LoginSvgComponent {}

@Component({
    selector: 'app-login',
    imports: [LoginSvgComponent, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-sm px-6">
            <h1
                class="text-3xl sm:text-5xl font-bold tracking-tight flex justify-center items-center gap-2"
            >
                <app-login-svg />
                Astrology
            </h1>

            <div class="w-full space-y-5">
                <input
                    class="w-full bg-transparent border border-white rounded-lg px-5 py-3.5 
                           text-white placeholder:text-white focus:outline-none focus:border-white 
                           text-lg transition-colors"
                    [(ngModel)]="username"
                    type="text"
                    placeholder="Username"
                />

                <input
                    class="w-full bg-transparent border border-white rounded-lg px-5 py-3.5 
                           text-white placeholder:text-white focus:outline-none focus:border-white 
                           text-lg transition-colors"
                    [(ngModel)]="password"
                    type="password"
                    placeholder="Password"
                />
            </div>

            <button
                class="w-full bg-white text-[#522793] font-semibold py-3 rounded-lg 
               hover:bg-white/90 transition-colors text-lg"
                (click)="signIn()"
            >
                Sign In
            </button>
        </div>
        <p-toast position="bottom-right" key="br"></p-toast>
    `,
    host: {
        class: 'grow-0 shrink-0 bg-[#522793] flex justify-center items-center text-white min-h-screen',
    },
})
export default class LoginComponent implements OnDestroy {
    private router = inject(Router);
    private auth = inject(AuthService);
    private messageService = inject(MessageService);
    subscription = new Subscription();
    username = signal('');
    password = signal('');
    form = computed(() => ({
        username: this.username().trim(),
        password: this.password().trim(),
    }));

    signIn() {
        if (this.username().length === 0 || this.password().length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                key: 'br',
                detail: 'Enter both the username and password',
                life: 4000,
            });
        } else {
            this.subscription = this.auth.login(this.form()).subscribe({
                next: (res: AuthResponse) => {
                    this.router.navigate(['/astrology/houses']);
                    this.auth.isLoggingOut.set(false);
                    this.auth.loggedIn.next(1);
                },
                error: (err: HttpErrorResponse) => {
                    let errorMsg = 'An unexpected error occurred';

                    if (err.error && typeof err.error === 'object') {
                        if (err.error.error) {
                            errorMsg = err.error.error;
                        } else if (err.error.message) {
                            errorMsg = err.error.message;
                        }
                    } else if (typeof err.error === 'string') {
                        errorMsg = err.error;
                    } else if (err.message) {
                        errorMsg = err.message;
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        key: 'br',
                        detail: errorMsg,
                        life: 4000,
                    });
                },
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
