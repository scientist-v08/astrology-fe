import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar';
import { SideBarComponent } from './sidebar';

@Component({
    selector: 'app-main-content',
    imports: [RouterOutlet, SideBarComponent, NavbarComponent],
    template: `
        <div class="flex w-full h-screen overflow-hidden">
            <app-sidebar
                class="hidden md:flex md:w-1/5 shrink-0 bg-brand pt-6 pb-6 flex-col gap-10 h-full"
            ></app-sidebar>
            <div class="flex flex-col flex-1 min-w-0 min-h-0">
                <app-navbar
                    class="h-14 sm:h-16 bg-white shadow-lg shrink-0"
                ></app-navbar>
                <main
                    class="flex-1 overflow-y-auto overflow-x-hidden bg-surface px-4 py-6 sm:px-6 md:px-10 md:py-9 flex flex-col gap-4 sm:gap-6 min-w-0"
                >
                    <router-outlet />
                </main>
            </div>
        </div>
    `,
})
export default class MainContentComponent {}