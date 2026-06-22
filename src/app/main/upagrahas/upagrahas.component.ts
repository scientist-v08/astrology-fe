import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    OnDestroy,
    signal,
    viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import {
    UpagrahasNKarakamshasResBody,
    UpagrahasNKarakamshasResponse,
} from '../../models/upagrahas.interface';
import { ZodiacSign } from '../../models/zodiac-sign.interface';
import { ApiService } from '../../services/api.service';

type PlacementKey =
    | 'ascendant'
    | 'dhuma'
    | 'vyatipata'
    | 'parivesha'
    | 'indrachapa'
    | 'upaketu'
    | 'gulika'
    | 'pranapada';

export type UpagrahaPlacements = {
    [key in PlacementKey]: string | null;
};

interface UpagrahaForm {
    placements: UpagrahaPlacements;
}

const INITIAL_UPAGRAHA_FORM: UpagrahaForm = {
    placements: {
        ascendant: null,
        dhuma: null,
        vyatipata: null,
        parivesha: null,
        indrachapa: null,
        upaketu: null,
        gulika: null,
        pranapada: null,
    },
};

@Component({
    selector: 'app-upagrahas',
    templateUrl: './upagrahas.component.html',
    imports: [FormsModule, SelectModule, ButtonModule, TableModule, ToastModule],
    providers: [MessageService],
    host: {
        class: 'flex-1 basis-full',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UpagrahasComponent implements OnDestroy {
    private messageService = inject(MessageService);
    private apiService = inject(ApiService);
    private unsubscribe$ = new Subject<void>();
    allEffects = signal<UpagrahasNKarakamshasResBody[]>([]);
    effects = viewChild<ElementRef>('effectsContainer');
    // Form state using signal (recommended for modern Angular)
    upagrahaForm = signal<UpagrahaForm>(structuredClone(INITIAL_UPAGRAHA_FORM));
    isFormValid = computed(() => {
        const placements = this.upagrahaForm().placements;
        return Object.values(placements).every((value) => value !== null && value !== '');
    });
    // Fields (we include ketu even if ignored in calculation)
    placementFields: { key: PlacementKey; label: string }[] = [
        { key: 'ascendant', label: 'Ascendant (Lagna)' },
        { key: 'dhuma', label: 'Dhūma (Smoke)' },
        { key: 'vyatipata', label: 'Vyatipāta' },
        { key: 'parivesha', label: 'Pariveṣa / Paridhi' },
        { key: 'indrachapa', label: 'Indrachāpa (Rainbow)' },
        { key: 'upaketu', label: 'Upaketu (Sikhi)' },
        { key: 'gulika', label: 'Gulika' },
        { key: 'pranapada', label: 'Prāṇapada' },
    ];
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
    updateUpagrahaPlacement(key: PlacementKey, value: string | null): void {
        this.upagrahaForm.update((current) => ({
            ...current,
            placements: {
                ...current.placements,
                [key]: value,
            },
        }));
    }
    callApi(): void {
        if (!this.isFormValid()) return;

        this.apiService
            .postToGetUpagrahaEffects(this.upagrahaForm().placements)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (val: UpagrahasNKarakamshasResponse) => {
                    this.allEffects.set(val.upgrahaEffects);
                    setTimeout(() => {
                        this.effects()?.nativeElement?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }, 20);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        key: 'br',
                        detail: 'Effects obtained',
                    });
                },
                error: (err) => {
                    this.allEffects.set([]);
                    this.messageService.add({
                        severity: 'error',
                        key: 'br',
                        summary: 'Error',
                        detail: 'Failed to obtain effects',
                    });
                },
            });
    }

    resetForm(): void {
        this.upagrahaForm.set(structuredClone(INITIAL_UPAGRAHA_FORM));
        this.allEffects.set([]);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
