import { Component } from '@angular/core';

@Component({
    selector: 'app-not-found',
    imports: [],
    template: ` Not found `,
    host: {
        class: 'grow-0 shrink-0 bg-[#522793] flex justify-center items-center text-white min-h-screen text-6xl',
    },
})
export class NotFoundComponent {}
