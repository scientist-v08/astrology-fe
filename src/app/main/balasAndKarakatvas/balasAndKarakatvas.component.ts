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
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import {
    BhavaLordAndShadBalaResBody,
    BhavaLordsForm,
} from '../../models/bhava-lord-effects.interface';
import { ZodiacSign } from '../../models/zodiac-sign.interface';
import { ApiService } from '../../services/api.service';

type PlacementKey =
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

type BalaKey = 'sthanaBala' | 'kaalaBala' | 'drigBala' | 'shadBala';

const createInitialBalasForm = (): BhavaLordsForm => ({
    placements: {
        ascendant: null,
        suryaPlacement: null,
        budhaPlacement: null,
        shukraPlacement: null,
        chandraPlacement: null,
        rahuPlacement: null,
        ketuPlacement: null,
        kujaPlacement: null,
        guruPlacement: null,
        shaniPlacement: null,
    },
    balas: {
        sthanaBala: Array(7).fill(0),
        kaalaBala: Array(7).fill(0),
        drigBala: Array(7).fill(0),
        shadBala: Array(7).fill(0),
    },
});

@Component({
    selector: 'app-balas-and-karakatvas',
    templateUrl: './balasAndKarakatvas.component.html',
    imports: [
        FormsModule,
        ButtonModule,
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
export default class BalasAndKarakatvasComponent implements OnDestroy {
    private messageService = inject(MessageService);
    activeStep = signal<number>(1);
    private apiService = inject(ApiService);
    unsubscribe$ = new Subject<void>();
    response = signal<BhavaLordAndShadBalaResBody | null>(null);
    effects = viewChild<ElementRef>('effectsContainer');
    signs = signal<ZodiacSign[]>([
        { label: 'Mesha (Aries)', value: 'Mesha' },
        { label: 'Vrushabha (Taurus)', value: 'Vrushabha' },
        { label: 'Mithuna (Gemini)', value: 'Mithuna' },
        { label: 'Karka (Cancer)', value: 'Karkataka' },
        { label: 'Simha (Leo)', value: 'Simha' },
        { label: 'Kanya (Virgo)', value: 'Kanya' },
        { label: 'Tula (Libra)', value: 'Tula' },
        { label: 'Vruschika (Scorpio)', value: 'Vruschika' },
        { label: 'Dhanu (Sagittarius)', value: 'Dhanassu' },
        { label: 'Makara (Capricorn)', value: 'Makara' },
        { label: 'Kumbha (Aquarius)', value: 'Kumbha' },
        { label: 'Meena (Pisces)', value: 'Meena' },
    ]);
    placementFields: { key: PlacementKey; label: string }[] = [
        { key: 'ascendant', label: 'Ascendant (Lagna)' },
        { key: 'suryaPlacement', label: 'Surya (Sun)' },
        { key: 'budhaPlacement', label: 'Budha (Mercury)' },
        { key: 'shukraPlacement', label: 'Shukra (Venus)' },
        { key: 'chandraPlacement', label: 'Chandra (Moon)' },
        { key: 'rahuPlacement', label: 'Rahu' },
        { key: 'ketuPlacement', label: 'Ketu' },
        { key: 'kujaPlacement', label: 'Kuja (Mars)' },
        { key: 'guruPlacement', label: 'Guru (Jupiter)' },
        { key: 'shaniPlacement', label: 'Shani (Saturn)' },
    ];
    balaFields: { key: BalaKey; label: string }[] = [
        { key: 'sthanaBala', label: 'Sthana Bala' },
        { key: 'kaalaBala', label: 'Kaala Bala' },
        { key: 'drigBala', label: 'Drig Bala' },
        { key: 'shadBala', label: 'Shad Bala' },
    ];
    balaIndexes = [0, 1, 2, 3, 4, 5, 6];
    balaOrderLabels = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    form = signal<BhavaLordsForm>(createInitialBalasForm());
    placementsIncomplete = computed(() => {
        const p = this.form().placements;
        return (
            p.ascendant === null ||
            p.suryaPlacement === null ||
            p.budhaPlacement === null ||
            p.shukraPlacement === null ||
            p.chandraPlacement === null ||
            p.rahuPlacement === null ||
            p.ketuPlacement === null ||
            p.kujaPlacement === null ||
            p.guruPlacement === null ||
            p.shaniPlacement === null
        );
    });
    balasIncomplete = computed(() => {
        const balas = this.form().balas;
        return this.balaFields.some((field) =>
            balas[field.key].some((value) => value === 0 || Number.isNaN(value)),
        );
    });
    submitIncomplete = computed(() => this.placementsIncomplete() || this.balasIncomplete());

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onStepChange(step: number | undefined) {
        if (step != undefined) {
            this.activeStep.set(step);
        }
    }

    updatePlacement(key: PlacementKey, value: string) {
        this.form.update((f) => ({
            ...f,
            placements: {
                ...f.placements,
                [key]: value,
            },
        }));
    }

    updateBala(key: BalaKey, index: number, value: number) {
        this.form.update((f) => {
            const updated = [...f.balas[key]];
            updated[index] = Number(value);

            return {
                ...f,
                balas: {
                    ...f.balas,
                    [key]: updated,
                },
            };
        });
    }

    goToNextStep(nextStep: number, activateCallback: (step: number) => void): void {
        if (this.placementsIncomplete()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'The positions of some grahas are missing',
                key: 'br',
                life: 3000,
            });
        } else {
            activateCallback(nextStep);
        }
    }

    submitForm() {
        if (this.placementsIncomplete()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'The positions of some grahas are missing',
                key: 'br',
                life: 3000,
            });
            return;
        }

        if (this.balasIncomplete()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'All bala values must be non-zero',
                key: 'br',
                life: 3000,
            });
            return;
        }

        this.apiService
            .postToGetAllBhavaLordEffects(this.form())
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (res: BhavaLordAndShadBalaResBody) => {
                    this.response.set(res);
                    setTimeout(() => {
                        this.effects()?.nativeElement?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }, 20);
                },
                error: () => {
                    this.response.set(null);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Unable to fetch',
                        key: 'br',
                        life: 3000,
                    });
                },
            });
    }

    resetForm(): void {
        this.form.set(createInitialBalasForm());
        this.activeStep.set(1);
        this.response.set(null);
    }
}
