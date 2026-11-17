import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeoapifyResponse } from '../models/geoapifyFeature.interface';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root',
})
export class GeoapifyService {
    private http = inject(HttpClient);
    url = environment.BASEURL;

    public searchPlaces(query: string): Observable<GeoapifyResponse> {
        const urL = this.url + 'autocomplete';
        const params = new HttpParams().set('text', query);

        return this.http.get<GeoapifyResponse>(urL, { params });
    }
}
