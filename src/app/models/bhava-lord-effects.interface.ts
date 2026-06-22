export interface BhavaLordAndShadBalaReqBody {
    ascendant: string;
    suryaPlacement: string;
    budhaPlacement: string;
    shukraPlacement: string;
    chandraPlacement: string;
    rahuPlacement: string;
    ketuPlacement: string;
    kujaPlacement: string;
    guruPlacement: string;
    shaniPlacement: string;
    sthanaBala: number[];
    kaalaBala: number[];
    drigBala: number[];
    shadBala: number[];
}

export interface BhavaLordsForm {
    placements: Placements;
    balas: Balas;
}

export interface Placements {
    ascendant: string | null;
    suryaPlacement: string | null;
    budhaPlacement: string | null;
    shukraPlacement: string | null;
    chandraPlacement: string | null;
    rahuPlacement: string | null;
    ketuPlacement: string | null;
    kujaPlacement: string | null;
    guruPlacement: string | null;
    shaniPlacement: string | null;
}

export interface Balas {
    sthanaBala: number[];
    kaalaBala: number[];
    drigBala: number[];
    shadBala: number[];
}

export interface BhavaLordAndShadBalaResBody {
    effects: string[];
    kaalaranks: Kaalarank[];
    shadBalaComments: string;
    shadRanks: ShadRank[];
    sthanaRanks: SthanaRank[];
    top3KaalaLords: string;
    top3SthanaLords: string;
}

export interface Kaalarank {
    graha: string;
    effectiveBala: number;
    rank: number;
}

export interface ShadRank {
    graha: string;
    effectiveBala: number;
    rank: number;
}

export interface SthanaRank {
    graha: string;
    effectiveBala: number;
    rank: number;
}
