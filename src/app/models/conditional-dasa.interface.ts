export interface ConditionalDasaInterface {
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
    ascendantDeg: DegreeInterface;
    suryaDeg: DegreeInterface;
    chandraDeg: DegreeInterface;
}

export interface DegreeInterface {
    deg: number;
    min: number;
}
