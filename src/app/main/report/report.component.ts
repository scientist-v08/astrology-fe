import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DateTime } from 'luxon';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ReportReqInterface } from '../../models/report.interface';
import { ApiService } from '../../services/api.service';
import { GeoapifyService } from '../../services/geoapify.service';
import { GeoapifyFeature } from '../../models/geoapifyFeature.interface';
import {
    AllHouseEffectInterface,
    KarakamshaResultsInterface,
} from '../../models/bhava-effects.interface';
import { BhavaLordAndShadBalaResBody } from '../../models/bhava-lord-effects.interface';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-report',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        SelectModule,
        ButtonModule,
        ChartModule,
        TableModule,
        DecimalPipe,
    ],
    templateUrl: './report.component.html',
})
export default class ReportComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private apiService = inject(ApiService);
    private geoapifyService = inject(GeoapifyService);

    private unsubscribe$ = new Subject<void>();

    // Dropdown options

    readonly years = Array.from({ length: 2200 - 1800 + 1 }, (_, i) => ({
        label: String(1800 + i),
        value: 1800 + i,
    }));

    readonly months = [
        { label: 'January', value: 1 },
        { label: 'February', value: 2 },
        { label: 'March', value: 3 },
        { label: 'April', value: 4 },
        { label: 'May', value: 5 },
        { label: 'June', value: 6 },
        { label: 'July', value: 7 },
        { label: 'August', value: 8 },
        { label: 'September', value: 9 },
        { label: 'October', value: 10 },
        { label: 'November', value: 11 },
        { label: 'December', value: 12 },
    ];

    readonly hours = Array.from({ length: 24 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        value: i,
    }));

    readonly minutes = Array.from({ length: 60 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        value: i,
    }));

    days: { label: string; value: number }[] = [];

    // Place autocomplete

    placeSuggestions: GeoapifyFeature[] = [];

    selectedPlace: GeoapifyFeature | null = null;

    isLoadingPlaces = false;
    isSubmitting = false;

    // Form

    reportForm = this.fb.group({
        year: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(1800),
            Validators.max(2200),
        ]),

        month: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(12),
        ]),

        day: new FormControl<number | null>(null, [Validators.required]),

        hour: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(0),
            Validators.max(23),
        ]),

        minute: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(0),
            Validators.max(59),
        ]),
    });

    placeControl = new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    allEffects = signal<AllHouseEffectInterface[]>([]);
    response = signal<BhavaLordAndShadBalaResBody | null>(null);
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

    ngOnInit(): void {
        this.initializeDateDropdowns();
        this.initializePlaceAutocomplete();
    }

    // -----------------------------------------
    // Date dropdowns
    // -----------------------------------------

    private initializeDateDropdowns(): void {
        this.reportForm.controls.year.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.updateDays());

        this.reportForm.controls.month.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.updateDays());
    }

    private updateDays(): void {
        const year = this.reportForm.controls.year.value;
        const month = this.reportForm.controls.month.value;

        if (!year || !month) {
            this.days = [];
            this.reportForm.controls.day.setValue(null);
            return;
        }

        const totalDays = new Date(year, month, 0).getDate();

        this.days = Array.from({ length: totalDays }, (_, i) => ({
            label: String(i + 1).padStart(2, '0'),
            value: i + 1,
        }));

        const selectedDay = this.reportForm.controls.day.value;

        if (selectedDay && selectedDay > totalDays) {
            this.reportForm.controls.day.setValue(null);
        }
    }

    // -----------------------------------------
    // Place autocomplete
    // -----------------------------------------

    private initializePlaceAutocomplete(): void {
        this.placeControl.valueChanges
            .pipe(
                debounceTime(350),
                distinctUntilChanged(),

                tap((query) => {
                    if (query !== this.selectedPlace?.properties.formatted) {
                        this.selectedPlace = null;
                    }

                    if (query.trim().length < 3) {
                        this.placeSuggestions = [];
                        this.isLoadingPlaces = false;
                    }
                }),

                filter((value) => value.trim().length >= 3),

                switchMap((query) => {
                    this.isLoadingPlaces = true;

                    return this.geoapifyService
                        .searchPlaces(query)
                        .pipe(catchError(() => of({ features: [] })));
                }),

                takeUntil(this.unsubscribe$),
            )
            .subscribe((response) => {
                this.placeSuggestions = response.features;
                this.isLoadingPlaces = false;
            });
    }

    selectPlace(place: GeoapifyFeature): void {
        this.selectedPlace = place;

        this.placeControl.setValue(place.properties.formatted, { emitEvent: false });

        this.placeSuggestions = [];
    }

    // -----------------------------------------
    // Timezone and ISO datetime
    // -----------------------------------------

    private getBirthDateTime(): string | null {
        if (!this.selectedPlace) {
            return null;
        }

        const timezone = this.selectedPlace.properties.timezone?.name;

        if (!timezone) {
            return null;
        }

        const { year, month, day, hour, minute } = this.reportForm.getRawValue();

        if (year === null || month === null || day === null || hour === null || minute === null) {
            return null;
        }

        const birthDateTime = DateTime.fromObject(
            {
                year,
                month,
                day,
                hour,
                minute,
                second: 0,
            },
            {
                zone: timezone,
            },
        );

        if (!birthDateTime.isValid) {
            return null;
        }

        // Reject nonexistent local times caused by
        // daylight-saving clock transitions.
        if (
            birthDateTime.year !== year ||
            birthDateTime.month !== month ||
            birthDateTime.day !== day ||
            birthDateTime.hour !== hour ||
            birthDateTime.minute !== minute
        ) {
            return null;
        }

        return birthDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");
    }

    // -----------------------------------------
    // Submit
    // -----------------------------------------

    submitReport(): void {
        this.reportForm.markAllAsTouched();
        this.placeControl.markAsTouched();

        if (this.reportForm.invalid || this.placeControl.invalid || !this.selectedPlace) {
            return;
        }

        const birthDateTime = this.getBirthDateTime();

        if (!birthDateTime) {
            console.error('Unable to determine a valid birth datetime and timezone.');
            return;
        }

        const payload: ReportReqInterface = {
            birthDateTime,
            latitude: this.selectedPlace.properties.lat,
            longitude: this.selectedPlace.properties.lon,
        };

        this.isSubmitting = true;

        this.apiService
            .postToGetReport(payload)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (response) => {
                    this.isSubmitting = false;

                    const houseResults = response.result;
                    this.allEffects.set(houseResults.allHouseEffects);
                    this.generalEffects.set(houseResults.generalEffects);
                    this.zeroProportionHouse.set(houseResults.zeroProportion);
                    this.allKarakamshaResults.set(houseResults.karakamshaResults);
                    this.proportionsObtained.set(houseResults.proportions);
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
                    this.response.set(response.bhavaLordsResults);
                    setTimeout(() => {
                        this.effects()?.nativeElement?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }, 20);
                },
                error: (error) => {
                    this.isSubmitting = false;
                    this.allEffects.set([]);
                    this.generalEffects.set([]);
                    this.zeroProportionHouse.set(0);
                    this.proportionsObtained.set([]);
                    this.allKarakamshaResults.set([]);
                    this.data.set(undefined);
                    this.options.set(undefined);
                    this.response.set(null);
                    console.error('Report API error:', error);
                },
            });
    }

    // -----------------------------------------
    // Reset
    // -----------------------------------------

    resetForm(): void {
        this.reportForm.reset();
        this.placeControl.reset('');
        this.response.set(null);
        this.allEffects.set([]);
        this.generalEffects.set([]);
        this.zeroProportionHouse.set(0);
        this.proportionsObtained.set([]);
        this.allKarakamshaResults.set([]);
        this.data.set(undefined);
        this.options.set(undefined);
        this.response.set(null);
        this.days = [];
        this.selectedPlace = null;
        this.placeSuggestions = [];
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
