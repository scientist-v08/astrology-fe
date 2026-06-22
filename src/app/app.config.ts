import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import customPreset from './custom-preset';
import { AuthInterceptor } from './interceptors/interceptor.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withInterceptors([AuthInterceptor]), withFetch()),
        providePrimeNG({
            theme: {
                preset: customPreset,
                options: {
                    darkModeSelector: false,
                },
            },
        }),
    ],
};
