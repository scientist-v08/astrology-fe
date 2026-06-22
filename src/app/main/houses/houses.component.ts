import { DecimalPipe } from '@angular/common';
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
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import {
    AllHouseEffectInterface,
    BhavaEffectsInterface,
    KarakamshaResultsInterface,
} from '../../models/bhava-effects.interface';
import { NavamshaChart } from '../../models/navamsha-chart.interface';
import { RasiChart } from '../../models/rasi-chart.interface';
import { Form } from '../../models/rasi-form.interface';
import { ZodiacSign } from '../../models/zodiac-sign.interface';
import { ApiService } from '../../services/api.service';

const INITIAL_HOUSES_FORM: Form = {
    rasi: {
        ascendant: null,
        surya: null,
        budha: null,
        budhaCombust: false,
        budhaUnafflicted: false,
        shukra: null,
        shukraCombust: false,
        chandra: null,
        chandraWaxing: false,
        kuja: null,
        kujaCombust: false,
        guru: null,
        guruCombust: false,
        shani: null,
        shaniCombust: false,
        rahu: null,
        ketu: null,
        isFirstHalf: false,
    },
    navamsha: {
        ascendant: null,
        surya: null,
        budha: null,
        shukra: null,
        chandra: null,
        kuja: null,
        guru: null,
        shani: null,
        rahu: null,
        ketu: null,
        karakamsha: null,
        navBudhaAfflicted: false,
    },
};

@Component({
    selector: 'app-houses',
    imports: [
        ChartModule,
        StepperModule,
        ButtonModule,
        CheckboxModule,
        SelectModule,
        FormsModule,
        ToastModule,
        TableModule,
        DecimalPipe,
    ],
    providers: [MessageService],
    templateUrl: './houses.component.html',
    host: {
        class: 'flex-1 basis-full',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HousesComponent implements OnDestroy {
    private messageService = inject(MessageService);
    private apiService = inject(ApiService);
    unsubscribe$ = new Subject<void>();
    allEffects = signal<AllHouseEffectInterface[]>([]);
    activeStep = signal<number>(1);
    labels = signal<string[]>([
        'First house',
        'Second house',
        'Third house',
        'Fourth house',
        'Fifth house',
        'Sixth house',
        'Seventh house',
        'Eighth house',
        'Ninth house',
        'Tenth house',
        'Eleventh house',
        'Twelfth house',
    ]);
    data = signal<any>(undefined);
    options = signal<any>(undefined);
    color = signal<string[]>([
        '#522793',
        '#6b3aad',
        '#8b5fc4',
        '#32bfbd',
        '#5aaea8',
        '#7ec4c0',
        '#b89ad9',
        '#a07fcc',
        '#d4c2eb',
        '#c9b3e3',
        '#9f8ab8',
        '#d4f0ef',
    ]);
    generalEffects = signal<string[]>([]);
    allKarakamshaResults = signal<KarakamshaResultsInterface[]>([]);
    zeroProportionHouse = signal<number>(0);
    proportionsObtained = signal<number[]>([]);
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
    form = signal<Form>(structuredClone(INITIAL_HOUSES_FORM));
    rasiIsIncomplete = computed(() => {
        const r = this.form().rasi;

        return (
            r.ascendant === null ||
            r.surya === null ||
            r.budha === null ||
            r.shukra === null ||
            r.chandra === null ||
            r.kuja === null ||
            r.guru === null ||
            r.shani === null ||
            r.rahu === null ||
            r.ketu === null
        );
    });
    inMakaraOrDhanuFirstHalf = computed(() => {
        const a = this.form().rasi.ascendant;
        if (a === 'Dhanassu' || a === 'Makara') {
            return true;
        }
        return false;
    });
    navamshaIsIncomplete = computed(() => {
        const r = this.form().navamsha;

        return (
            r.ascendant === null ||
            r.surya === null ||
            r.budha === null ||
            r.shukra === null ||
            r.chandra === null ||
            r.kuja === null ||
            r.guru === null ||
            r.shani === null ||
            r.rahu === null ||
            r.ketu === null ||
            r.karakamsha === null
        );
    });

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    submitForm() {
        if (this.navamshaIsIncomplete()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'The positions of some grahas are missing',
                key: 'br',
                life: 3000,
            });
        } else {
            this.apiService
                .postToGetAllBhavaEffects(this.form())
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                    next: (res: BhavaEffectsInterface) => {
                        this.allEffects.set(res.allHouseEffects);
                        this.generalEffects.set(res.generalEffects);
                        this.zeroProportionHouse.set(res.zeroProportion);
                        this.allKarakamshaResults.set(res.karakamshaResults);
                        this.proportionsObtained.set(res.proportions);
                        this.data.set({
                            labels: this.labels(),
                            datasets: [
                                {
                                    data: this.proportionsObtained(),
                                    backgroundColor: this.color(),
                                },
                            ],
                        });
                        this.options.set({
                            cutout: '60%',
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                        });
                        setTimeout(() => {
                            this.effects()?.nativeElement?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                            });
                        }, 20);
                    },
                    error: () => {
                        this.allEffects.set([]);
                        this.generalEffects.set([]);
                        this.zeroProportionHouse.set(0);
                        this.proportionsObtained.set([]);
                        this.allKarakamshaResults.set([]);
                        this.data.set(undefined);
                        this.options.set(undefined);
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
    }

    goToNextStep(nextStep: number, activateCallback: (step: number) => void): void {
        if (this.rasiIsIncomplete()) {
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

    // ── Update helpers ─────────────────────────────────────────────

    updateRasi(key: keyof RasiChart, value: string | null | boolean) {
        this.form.update((f) => ({
            ...f,
            rasi: {
                ...f.rasi,
                [key]: value,
            },
        }));
    }

    updateNavamsha(key: keyof NavamshaChart, value: string | null | boolean) {
        this.form.update((f) => ({
            ...f,
            navamsha: {
                ...f.navamsha,
                [key]: value,
            },
        }));
    }

    updateRasiCombust(
        key:
            | 'budhaCombust'
            | 'shukraCombust'
            | 'kujaCombust'
            | 'guruCombust'
            | 'shaniCombust'
            | 'chandraWaxing'
            | 'budhaUnafflicted'
            | 'isFirstHalf',
        value: boolean,
    ) {
        this.form.update((f) => ({
            ...f,
            rasi: {
                ...f.rasi,
                [key]: value,
            },
        }));
    }

    onStepChange(newValue: number | undefined) {
        if (newValue != undefined) {
            if (newValue < this.activeStep()) {
                return;
            }
            this.activeStep.set(newValue);
        }
    }

    resetForm(): void {
        this.form.set(structuredClone(INITIAL_HOUSES_FORM));
        this.activeStep.set(1);
        this.allEffects.set([]);
        this.generalEffects.set([]);
        this.allKarakamshaResults.set([]);
        this.zeroProportionHouse.set(0);
        this.proportionsObtained.set([]);
        this.data.set(undefined);
        this.options.set(undefined);
    }
}
