import { Component, inject, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { AuthService } from '../services/auth.service';
import { AstroSvgComponent } from '../svg/astrosvg.component';

@Component({
    selector: 'app-navbar',
    imports: [PopoverModule, MenubarModule, AstroSvgComponent],
    host: {
        class: 'block w-full',
    },
    template: `
        <!-- Mobile navigation -->
        <p-menubar class="md:hidden" [model]="items()">
            <ng-template #end>
                <h1 class="flex items-center gap-1 text-lg sm:text-2xl font-semibold text-white">
                    <app-astro-svg />
                    Astrology
                </h1>
            </ng-template>
        </p-menubar>

        <!-- Desktop account bar -->
        <div
            class="hidden md:flex h-full items-center justify-end gap-2 px-10 py-3 font-lexend text-sm font-medium"
        >
            <button
                class="flex items-center gap-2 cursor-pointer text-text-primary hover:text-brand transition-colors"
                type="button"
                (click)="op.toggle($event)"
            >
                My Account
                <img class="h-5" src="/assets/user.svg" alt="" />
            </button>
        </div>

        <p-popover #op [dismissable]="true">
            <button
                class="w-full px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-3 font-medium text-left"
                type="button"
                (click)="logout(); op.hide()"
            >
                Logout
            </button>
        </p-popover>
    `,
})
export class NavbarComponent {
    private authService = inject(AuthService);
    items = signal<MenuItem[]>([
        { label: 'Houses', routerLink: '/astrology/houses' },
        { label: 'Balas & Karakatavas', routerLink: '/astrology/bnk' },
        { label: 'Pair matching', routerLink: '/astrology/pairing' },
        { label: 'Upagrahas', routerLink: '/astrology/upagrahas' },
        { label: 'Logout', command: () => this.logout() },
    ]);
    logout(): void {
        this.authService.logout();
    }
}
