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
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import {
    allNakshatrasByRashi,
    PairingReq,
    PairingResponse,
} from '../../models/rashiNakshatra.interface';
import { ZodiacSign } from '../../models/zodiac-sign.interface';
import { ApiService } from '../../services/api.service';

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
    | 'shaniPlacement'
    | 'nakshatra';

export interface PlacementForm {
    placements: Record<PlacementKey, string | null>;
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
        nakshatra: null,
    },
});

@Component({
    selector: 'app-pair-matching',
    templateUrl: './pairMatching.component.html',
    imports: [
        FormsModule,
        ButtonModule,
        CheckboxModule,
        InputNumberModule,
        SelectModule,
        StepperModule,
        TableModule,
        ToastModule,
    ],
    providers: [MessageService],
    host: {
        class: 'flex-1 basis-full',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PairMatchingComponent implements OnDestroy {
    private messageService = inject(MessageService);
    private apiService = inject(ApiService);
    private unsubscribe$ = new Subject<void>();

    // Signals for steppers
    groomActiveStep = signal<number>(1);
    brideActiveStep = signal<number>(1);

    // Signal for response
    allEffects = signal<PairingResponse | null>(null);
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
        { key: 'nakshatra', label: 'Nakshatra' },
        { key: 'shukraPlacement', label: 'Shukra (Venus)' },
        { key: 'kujaPlacement', label: 'Kuja (Mars)' },
        { key: 'shaniPlacement', label: 'Shani (Saturn)' },
        { key: 'budhaPlacement', label: 'Budha (Mercury)' },
        { key: 'rahuPlacement', label: 'Rahu' },
        { key: 'guruPlacement', label: 'Guru (Jupiter)' },
        { key: 'ketuPlacement', label: 'Ketu' },
    ];

    groomNakshatras = computed(() => {
        const gr = this.groomForm().placements.chandraPlacement;
        if (gr != null) {
            return allNakshatrasByRashi[gr];
        } else {
            return [];
        }
    });

    brideNakshatras = computed(() => {
        const gr = this.brideForm().placements.chandraPlacement;
        if (gr != null) {
            return allNakshatrasByRashi[gr];
        } else {
            return [];
        }
    });

    // Form state - separate for groom & bride
    groomForm = signal<PlacementForm>(createInitialPlacementForm());
    brideForm = signal<PlacementForm>(createInitialPlacementForm());

    // Validation computed signals
    groomPlacementsIncomplete = computed(() => {
        const p = this.groomForm().placements;
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
            p.nakshatra,
        ].some((v) => v === null);
    });

    bridePlacementsIncomplete = computed(() => {
        const p = this.brideForm().placements;
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
            p.nakshatra,
        ].some((v) => v === null);
    });

    groomFirstHalf = signal<boolean>(false);
    brideFirstHalf = signal<boolean>(false);

    inMakaraOrDhanuFirstHalfBride = computed(() => {
        const a = this.brideForm().placements.chandraPlacement;
        if (a === 'Dhanassu' || a === 'Makara') {
            return true;
        }
        return false;
    });

    inMakaraOrDhanuFirstHalfGroom = computed(() => {
        const a = this.groomForm().placements.chandraPlacement;
        if (a === 'Dhanassu' || a === 'Makara') {
            return true;
        }
        return false;
    });

    // Groom step change
    onGroomStepChange(step: number | undefined) {
        if (step !== undefined) this.groomActiveStep.set(step);
    }

    updateGroomPlacement(key: PlacementKey, value: string) {
        this.groomForm.update((f) => ({
            ...f,
            placements: { ...f.placements, [key]: value },
        }));
    }

    updateBridePlacement(key: PlacementKey, value: string) {
        this.brideForm.update((f) => ({
            ...f,
            placements: { ...f.placements, [key]: value },
        }));
    }

    updateGroomHalf(): void {
        this.groomFirstHalf.update((val) => !val);
    }

    updateBrideHalf(): void {
        this.brideFirstHalf.update((val) => !val);
    }

    goToNextGroomStep(nextStep: number, activateCallback: (step: number) => void) {
        if (this.groomPlacementsIncomplete()) {
            this.messageService.add({
                severity: 'error',
                key: 'br',
                summary: 'Incomplete',
                detail: 'Please select all required graha placements for Groom',
                life: 4000,
            });
        } else {
            activateCallback(nextStep);
        }
    }

    submitDoshaSamya() {
        if (this.bridePlacementsIncomplete()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Incomplete',
                key: 'br',
                detail: 'Bride placements are not complete',
                life: 4000,
            });
            return;
        }

        // Build payload matching PairingReqBody (adjust field names if needed)
        const payload: PairingReq = {
            groomAscendant: this.groomForm().placements.ascendant || '',
            groomSuryaPlacement: this.groomForm().placements.suryaPlacement || '',
            groomChandraPlacement: this.groomForm().placements.chandraPlacement || '',
            groomBudhaPlacement: this.groomForm().placements.budhaPlacement || '',
            groomRaashi: this.groomForm().placements.chandraPlacement || '',
            groomShukraPlacement: this.groomForm().placements.shukraPlacement || '',
            groomKujaPlacement: this.groomForm().placements.kujaPlacement || '',
            groomShaniPlacement: this.groomForm().placements.shaniPlacement || '',
            groomRahuPlacement: this.groomForm().placements.rahuPlacement || '',
            groomGuruPlacement: this.groomForm().placements.guruPlacement || '',
            groomKetuPlacement: this.groomForm().placements.ketuPlacement || '',
            groomNakshatra: this.groomForm().placements.nakshatra || '',
            groomFirstHalf: this.groomFirstHalf(),

            brideAscendant: this.brideForm().placements.ascendant || '',
            brideSuryaPlacement: this.brideForm().placements.suryaPlacement || '',
            brideBudhaPlacement: this.brideForm().placements.budhaPlacement || '',
            brideChandraPlacement: this.brideForm().placements.chandraPlacement || '',
            brideRaashi: this.brideForm().placements.chandraPlacement || '',
            brideShukraPlacement: this.brideForm().placements.shukraPlacement || '',
            brideKujaPlacement: this.brideForm().placements.kujaPlacement || '',
            brideShaniPlacement: this.brideForm().placements.shaniPlacement || '',
            brideRahuPlacement: this.brideForm().placements.rahuPlacement || '',
            brideGuruPlacement: this.brideForm().placements.guruPlacement || '',
            brideKetuPlacement: this.brideForm().placements.ketuPlacement || '',
            brideNakshatra: this.brideForm().placements.nakshatra || '',
            brideFirstHalf: this.brideFirstHalf(),
        };

        this.apiService
            .calculateDoshaSamya(payload) // assume this method exists
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        key: 'br',
                        detail: 'Dosha Samya calculated!',
                    });
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
                        detail: 'Failed to calculate Dosha Samya',
                    });
                },
            });
    }

    resetForm(): void {
        this.groomForm.set(createInitialPlacementForm());
        this.brideForm.set(createInitialPlacementForm());
        this.groomActiveStep.set(1);
        this.brideActiveStep.set(1);
        this.groomFirstHalf.set(false);
        this.brideFirstHalf.set(false);
        this.allEffects.set(null);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
