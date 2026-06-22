export interface RasiChart {
    ascendant: string | null;
    surya: string | null;
    budha: string | null;
    budhaCombust: boolean;
    budhaUnafflicted: boolean;
    shukra: string | null;
    shukraCombust: boolean;
    chandra: string | null;
    chandraWaxing: boolean;
    kuja: string | null;
    kujaCombust: boolean;
    guru: string | null;
    guruCombust: boolean;
    shani: string | null;
    shaniCombust: boolean;
    rahu: string | null;
    ketu: string | null;
    isFirstHalf: boolean;
}
