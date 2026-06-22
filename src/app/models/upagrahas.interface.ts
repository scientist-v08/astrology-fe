// Request Body - Sent to the backend
export interface UpagrahasNKarakamshasReqBody {
    ascendant: string;
    dhuma: string;
    vyatipata: string;
    parivesha: string;
    indrachapa: string;
    upaketu: string;
    gulika: string;
    pranapada: string;
}

export interface UpagrahasNKarakamshasResBody {
    upagraha: string;
    effects: string[];
}

export interface UpagrahasNKarakamshasResponse {
    upgrahaEffects: UpagrahasNKarakamshasResBody[];
}
