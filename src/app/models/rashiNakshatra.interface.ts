export interface RashiNakshatraInterface {
    label: string;
    value: string;
}

export type RashiNakshatraMapping = Record<string, RashiNakshatraInterface[]>;

export const allNakshatrasByRashi: RashiNakshatraMapping = {
    Mesha: [
        { label: 'Ashwini', value: 'Ashwini' },
        { label: 'Bharani', value: 'Bharani' },
        { label: 'Krittika', value: 'Krittika' },
    ],

    Vrushabha: [
        { label: 'Krittika', value: 'Krittika' },
        { label: 'Rohini', value: 'Rohini' },
        { label: 'Mrigashira', value: 'Mrigashira' },
    ],

    Mithuna: [
        { label: 'Mrigashira', value: 'Mrigashira' },
        { label: 'Ardra', value: 'Ardra' },
        { label: 'Punarvasu', value: 'Punarvasu' },
    ],

    Karkataka: [
        { label: 'Punarvasu', value: 'Punarvasu' },
        { label: 'Pushya', value: 'Pushya' },
        { label: 'Ashlesha', value: 'Ashlesha' },
    ],

    Simha: [
        { label: 'Magha', value: 'Magha' },
        { label: 'Purva Phalguni', value: 'Purva Phalguni' },
        { label: 'Uttara Phalguni', value: 'Uttara Phalguni' },
    ],

    Kanya: [
        { label: 'Uttara Phalguni', value: 'Uttara Phalguni' },
        { label: 'Hasta', value: 'Hasta' },
        { label: 'Chitra', value: 'Chitra' },
    ],

    Tula: [
        { label: 'Chitra', value: 'Chitra' },
        { label: 'Swati', value: 'Swati' },
        { label: 'Vishakha', value: 'Vishakha' },
    ],

    Vruschika: [
        { label: 'Vishakha', value: 'Vishakha' },
        { label: 'Anuradha', value: 'Anuradha' },
        { label: 'Jyeshtha', value: 'Jyeshtha' },
    ],

    Dhanassu: [
        { label: 'Mula', value: 'Mula' },
        { label: 'Purva Ashadha', value: 'Purva Ashadha' },
        { label: 'Uttara Ashadha', value: 'Uttara Ashadha' },
    ],

    Makara: [
        { label: 'Uttara Ashadha', value: 'Uttara Ashadha' },
        { label: 'Shravana', value: 'Shravana' },
        { label: 'Dhanishta', value: 'Dhanishta' },
    ],

    Kumbha: [
        { label: 'Dhanishta', value: 'Dhanishta' },
        { label: 'Shatabhisha', value: 'Shatabhisha' },
        { label: 'Purva Bhadrapada', value: 'Purva Bhadrapada' },
    ],

    Meena: [
        { label: 'Purva Bhadrapada', value: 'Purva Bhadrapada' },
        { label: 'Uttara Bhadrapada', value: 'Uttara Bhadrapada' },
        { label: 'Revati', value: 'Revati' },
    ],
};

export interface PairingResponse {
    brideDosha: BrideDosha[];
    groomDosha: GroomDosha[];
    kuta: Kuum[];
    rajjuAndOther: string;
    whoseIsGreater: string;
}

export interface BrideDosha {
    ascendantConsidered: string;
    grahaInQuestion: string;
    doshaScore: number;
}

export interface GroomDosha {
    ascendantConsidered: string;
    grahaInQuestion: string;
    doshaScore: number;
}

export interface Kuum {
    index: number;
    score: number;
    comments: string;
}

export interface PairingReq {
    groomAscendant: string;
    groomSuryaPlacement: string;
    groomChandraPlacement: string;
    groomBudhaPlacement: string;
    groomRaashi: string;
    groomShukraPlacement: string;
    groomKujaPlacement: string;
    groomShaniPlacement: string;
    groomRahuPlacement: string;
    groomGuruPlacement: string;
    groomKetuPlacement: string;
    groomNakshatra: string;
    groomFirstHalf: boolean;
    brideAscendant: string;
    brideSuryaPlacement: string;
    brideBudhaPlacement: string;
    brideChandraPlacement: string;
    brideRaashi: string;
    brideShukraPlacement: string;
    brideKujaPlacement: string;
    brideShaniPlacement: string;
    brideRahuPlacement: string;
    brideGuruPlacement: string;
    brideKetuPlacement: string;
    brideNakshatra: string;
    brideFirstHalf: boolean;
}
