import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../services/api.service';
import { Subject, takeUntil } from 'rxjs';
import { ZodiacSign } from '../../models/zodiac-sign.interface';
import { ConditionalDasaInterface } from '../../models/conditional-dasa.interface';

export type PlacementKey =
    | 'ascendant'
    | 'suryaPlacement'
    | 'budhaPlacement'
    | 'shukraPlacement'
    | 'chandraPlacement'
    | 'rahuPlacement'
    | 'ketuPlacement'
    | 'kujaPlacement'
    | 'guruPlacement'
    | 'shaniPlacement';

export interface PlacementForm {
    placements: Record<PlacementKey, string | null>;
    lagna: {
        degree: number | null;
        minute: number | null;
    };

    chandra: {
        degree: number | null;
        minute: number | null;
    };

    surya: {
        degree: number | null;
        minute: number | null;
    };
}

const createInitialPlacementForm = (): PlacementForm => ({
    placements: {
        ascendant: null,
        suryaPlacement: null,
        chandraPlacement: null,
        shukraPlacement: null,
        kujaPlacement: null,
        shaniPlacement: null,
        rahuPlacement: null,
        guruPlacement: null,
        ketuPlacement: null,
        budhaPlacement: null,
    },

    lagna: {
        degree: null,
        minute: null,
    },

    chandra: {
        degree: null,
        minute: null,
    },

    surya: {
        degree: null,
        minute: null,
    },
});

type DegreePlacement = 'lagna' | 'chandra' | 'surya';

@Component({
    selector: 'app-conditional-dasa',
    templateUrl: './conditionalDasas.component.html',
    imports: [
        FormsModule,
        ButtonModule,
        CheckboxModule,
        InputNumberModule,
        SelectModule,
        TableModule,
        ToastModule,
    ],
    providers: [MessageService],
    host: {
        class: 'flex-1 basis-full',
    },
})
export default class ConditionalDasaComponent {
    private messageService = inject(MessageService);
    private apiService = inject(ApiService);
    private unsubscribe$ = new Subject<void>();

    // Signal for response
    allEffects = signal<string[] | null>(null);
    effects = viewChild<ElementRef>('effectsContainer');

    // Signs (same as your reference - adjust spelling if needed)
    signs = signal<ZodiacSign[]>([
        { label: 'Mesha (Aries)', value: 'Mesha' },
        { label: 'Vrushabha (Taurus)', value: 'Vrushabha' },
        { label: 'Mithuna (Gemini)', value: 'Mithuna' },
        { label: 'Karkataka (Cancer)', value: 'Karkataka' },
        { label: 'Simha (Leo)', value: 'Simha' },
        { label: 'Kanya (Virgo)', value: 'Kanya' },
        { label: 'Tula (Libra)', value: 'Tula' },
        { label: 'Vruschika (Scorpio)', value: 'Vruschika' },
        { label: 'Dhanassu (Sagittarius)', value: 'Dhanassu' },
        { label: 'Makara (Capricorn)', value: 'Makara' },
        { label: 'Kumbha (Aquarius)', value: 'Kumbha' },
        { label: 'Meena (Pisces)', value: 'Meena' },
    ]);

    // Fields (we include ketu even if ignored in calculation)
    placementFields: { key: PlacementKey; label: string }[] = [
        { key: 'ascendant', label: 'Ascendant (Lagna)' },
        { key: 'suryaPlacement', label: 'Surya (Sun)' },
        { key: 'chandraPlacement', label: 'Chandra (Moon)' },
        { key: 'shukraPlacement', label: 'Shukra (Venus)' },
        { key: 'kujaPlacement', label: 'Kuja (Mars)' },
        { key: 'shaniPlacement', label: 'Shani (Saturn)' },
        { key: 'budhaPlacement', label: 'Budha (Mercury)' },
        { key: 'rahuPlacement', label: 'Rahu' },
        { key: 'guruPlacement', label: 'Guru (Jupiter)' },
        { key: 'ketuPlacement', label: 'Ketu' },
    ];

    // Form state - separate for groom & bride
    vargaForm = signal<PlacementForm>(createInitialPlacementForm());

    // Validation computed signals
    vargaPlacementsIncomplete = computed(() => {
        const form = this.vargaForm();
        const p = form.placements;

        return [
            p.ascendant,
            p.suryaPlacement,
            p.chandraPlacement,
            p.shukraPlacement,
            p.kujaPlacement,
            p.shaniPlacement,
            p.rahuPlacement,
            p.guruPlacement,
            p.budhaPlacement,
            p.ketuPlacement,

            form.lagna.degree,
            form.lagna.minute,
            form.chandra.degree,
            form.chandra.minute,
            form.surya.degree,
            form.surya.minute,
        ].some((v) => v === null);
    });

    resetForm(): void {
        this.vargaForm.set(createInitialPlacementForm());
        this.allEffects.set(null);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    updateVargaPlacement(key: PlacementKey, value: string) {
        this.vargaForm.update((f) => ({
            ...f,
            placements: { ...f.placements, [key]: value },
        }));
    }

    updateDegree(
        placement: DegreePlacement,
        field: 'degree' | 'minute',
        value: number | null,
    ): void {
        this.vargaForm.update((form) => ({
            ...form,
            [placement]: {
                ...form[placement],
                [field]: value,
            },
        }));
    }

    onSubmit(): void {
        if (this.vargaPlacementsIncomplete()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Incomplete',
                key: 'br',
                detail: 'All the fields have to be filled',
                life: 4000,
            });
            return;
        }

        const form = this.vargaForm();
        const placements = form.placements;

        const payload: ConditionalDasaInterface = {
            ascendant: placements.ascendant || '',
            suryaPlacement: placements.suryaPlacement || '',
            budhaPlacement: placements.budhaPlacement || '',
            shukraPlacement: placements.shukraPlacement || '',
            chandraPlacement: placements.chandraPlacement || '',
            rahuPlacement: placements.rahuPlacement || '',
            ketuPlacement: placements.ketuPlacement || '',
            kujaPlacement: placements.kujaPlacement || '',
            guruPlacement: placements.guruPlacement || '',
            shaniPlacement: placements.shaniPlacement || '',

            ascendantDeg: {
                deg: form.lagna.degree ?? 0,
                min: form.lagna.minute ?? 0,
            },

            suryaDeg: {
                deg: form.surya.degree ?? 0,
                min: form.surya.minute ?? 0,
            },

            chandraDeg: {
                deg: form.chandra.degree ?? 0,
                min: form.chandra.minute ?? 0,
            },
        };

        this.apiService
            .getAllApplicableDasas(payload)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (response: string[]) => {
                    this.allEffects.set(response);

                    setTimeout(() => {
                        this.effects()?.nativeElement?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }, 20);
                },

                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        key: 'br',
                        summary: 'Error',
                        detail: 'Failed to calculate applicable conditional dasas',
                        life: 4000,
                    });
                },
            });
    }
}
