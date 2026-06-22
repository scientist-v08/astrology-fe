import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { UpagrahaPlacements } from '../main/upagrahas/upagrahas.component';
import {
    BhavaEffectsInterface,
    BhavaEffectsReqBodyInterface,
} from '../models/bhava-effects.interface';
import {
    BhavaLordAndShadBalaReqBody,
    BhavaLordAndShadBalaResBody,
    BhavaLordsForm,
} from '../models/bhava-lord-effects.interface';
import { PairingReq, PairingResponse } from '../models/rashiNakshatra.interface';
import { Form } from '../models/rasi-form.interface';
import {
    UpagrahasNKarakamshasReqBody,
    UpagrahasNKarakamshasResponse,
} from '../models/upagrahas.interface';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    http = inject(HttpClient);
    url = environment.BASEURL;

    public postToGetAllBhavaEffects(form: Form): Observable<BhavaEffectsInterface> {
        const reqUrl = this.url + 'houseEffects';
        const rasi = form.rasi;
        const navamsha = form.navamsha;
        const reqBody: BhavaEffectsReqBodyInterface = {
            ascendant: rasi.ascendant ?? '',
            suryaPlacement: rasi.surya ?? '',
            budhaPlacement: {
                placement: rasi.budha ?? '',
                combustion: rasi.budhaCombust ?? false,
            },
            shukraPlacement: {
                placement: rasi.shukra ?? '',
                combustion: rasi.shukraCombust ?? false,
            },
            chandraPlacement: rasi.chandra ?? '',
            chandraWaxing: rasi.chandraWaxing ?? false,
            rahuPlacement: rasi.rahu ?? '',
            ketuPlacement: rasi.ketu ?? '',
            kujaPlacement: {
                placement: rasi.kuja ?? '',
                combustion: rasi.kujaCombust ?? false,
            },
            guruPlacement: {
                placement: rasi.guru ?? '',
                combustion: rasi.guruCombust ?? false,
            },
            shaniPlacement: {
                placement: rasi.shani ?? '',
                combustion: rasi.shaniCombust ?? false,
            },
            budhaUnafflicted: rasi.budhaUnafflicted ?? false,
            firstHalf: rasi.isFirstHalf ?? false,
            nascendant: navamsha.ascendant ?? '',
            nsuryaPlacement: navamsha.surya ?? '',
            nbudhaPlacement: navamsha.budha ?? '',
            nshukraPlacement: navamsha.shukra ?? '',
            nchandraPlacement: navamsha.chandra ?? '',
            nrahuPlacement: navamsha.rahu ?? '',
            nketuPlacement: navamsha.ketu ?? '',
            nkujaPlacement: navamsha.kuja ?? '',
            nguruPlacement: navamsha.guru ?? '',
            nshaniPlacement: navamsha.shani ?? '',
            karakamsha: navamsha.karakamsha ?? '',
            navBudhaAfflicted: navamsha.navBudhaAfflicted ?? false,
        };

        return this.http.post<BhavaEffectsInterface>(reqUrl, reqBody);
    }

    public postToGetUpagrahaEffects(
        form: UpagrahaPlacements,
    ): Observable<UpagrahasNKarakamshasResponse> {
        const reqUrl = this.url + 'upagrahas';
        const payload: UpagrahasNKarakamshasReqBody = {
            ascendant: form.ascendant!,
            dhuma: form.dhuma!,
            vyatipata: form.vyatipata!,
            parivesha: form.parivesha!,
            indrachapa: form.indrachapa!,
            upaketu: form.upaketu!,
            gulika: form.gulika!,
            pranapada: form.pranapada!,
        };
        return this.http.post<UpagrahasNKarakamshasResponse>(reqUrl, payload);
    }

    public postToGetAllBhavaLordEffects(
        form: BhavaLordsForm,
    ): Observable<BhavaLordAndShadBalaResBody> {
        const reqUrl = this.url + 'bhavaEffects';
        const { placements, balas } = form;
        const reqBody: BhavaLordAndShadBalaReqBody = {
            ascendant: placements.ascendant!,
            suryaPlacement: placements.suryaPlacement!,
            budhaPlacement: placements.budhaPlacement!,
            shukraPlacement: placements.shukraPlacement!,
            chandraPlacement: placements.chandraPlacement!,
            rahuPlacement: placements.rahuPlacement!,
            ketuPlacement: placements.ketuPlacement!,
            kujaPlacement: placements.kujaPlacement!,
            guruPlacement: placements.guruPlacement!,
            shaniPlacement: placements.shaniPlacement!,

            sthanaBala: balas.sthanaBala as number[],
            kaalaBala: balas.kaalaBala as number[],
            drigBala: balas.drigBala as number[],
            shadBala: balas.shadBala as number[],
        };
        return this.http.post<BhavaLordAndShadBalaResBody>(reqUrl, reqBody);
    }

    public calculateDoshaSamya(form: PairingReq): Observable<PairingResponse> {
        const reqUrl = this.url + 'pairing';
        return this.http.post<PairingResponse>(reqUrl, form);
    }
}
