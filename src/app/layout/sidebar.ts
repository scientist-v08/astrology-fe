import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AstroSvgComponent } from '../svg/astrosvg.component';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, AstroSvgComponent],
    template: `
        <div class="flex items-center justify-center gap-2 text-xl text-white px-4">
            <app-astro-svg />
            Astrology
        </div>

        <nav class="flex flex-col gap-2 mt-8">
            <a
                class="text-white no-underline text-base px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                routerLink="/astrology/houses"
                routerLinkActive="bg-white/10"
            >
                <img class="h-5 w-5 shrink-0" src="/assets/houses.svg" alt="" />
                Houses
            </a>
            <a
                class="text-white no-underline text-base px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                routerLink="/astrology/bnk"
                routerLinkActive="bg-white/10"
            >
                <img class="h-5 w-5 shrink-0" src="/assets/dashboard.svg" alt="" />
                Balas & Karakatavas
            </a>
            <a
                class="text-white no-underline text-base px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                routerLink="/astrology/pairing"
                routerLinkActive="bg-white/10"
            >
                <img class="h-5 w-5 shrink-0" src="/assets/chart-line.svg" alt="" />
                Pair matching
            </a>
            <a
                class="text-white no-underline text-base px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                routerLink="/astrology/upagrahas"
                routerLinkActive="bg-white/10"
            >
                <img class="h-5 w-5 shrink-0" src="/assets/circle-broken.svg" alt="" />
                Upagrahas
            </a>
        </nav>
    `,
})
export class SideBarComponent {}
