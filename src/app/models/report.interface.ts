import {
    AllHouseEffectInterface,
    BhavaEffectsInterface,
    BhavaEffectsReqBodyInterface,
    KarakamshaResultsInterface,
} from './bhava-effects.interface';
import { BhavaLordAndShadBalaResBody } from './bhava-lord-effects.interface';

export interface ReportBhavaEffectsInterface {
    allHouseEffects: AllHouseEffectInterface[];
    zeroProportion: number;
    proportions: number[];
    generalEffects: string[];
    karakamshaResults: KarakamshaResultsInterface[];
    horoscope: BhavaEffectsReqBodyInterface;
}

export interface ReportInterface {
    result: ReportBhavaEffectsInterface;
    bhavaLordsResults: BhavaLordAndShadBalaResBody;
}

export interface ReportReqInterface {
    birthDateTime: string;
    latitude: number;
    longitude: number;
}
