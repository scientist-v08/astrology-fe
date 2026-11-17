import { BhavaEffectsInterface } from './bhava-effects.interface';
import { BhavaLordAndShadBalaResBody } from './bhava-lord-effects.interface';

export interface ReportInterface {
    result: BhavaEffectsInterface;
    bhavaLordsResults: BhavaLordAndShadBalaResBody;
}

export interface ReportReqInterface {
    birthDateTime: string;
    latitude: number;
    longitude: number;
}
