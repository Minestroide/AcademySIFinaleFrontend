import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, share} from "rxjs";


export interface IGeocoding {
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  country: string,
  country_code: string,
  elevation: number
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private token: string;
  private httpClient: HttpClient;
  private geocodingObservables: Observable<IGeocoding[]> | undefined = undefined;

  constructor(httpClient: HttpClient) {
    this.token = window.localStorage.getItem('token') as string;
    this.httpClient = httpClient;
  }

  refreshToken() {
    this.token = window.localStorage.getItem('token') as string;
  }

  clearCache() {
    this.geocodingObservables = undefined;
  }

  searchGeocodings(cityName: string): Observable<IGeocoding[]> {
    if(this.geocodingObservables) return this.geocodingObservables;

    let config = {
      params: new HttpParams().set('name', cityName),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }

    this.geocodingObservables = this.httpClient.get<IGeocoding[]>(`http://localhost:8080/api/geocoding`, config).pipe(share());

    this.geocodingObservables.subscribe(() => {
      this.geocodingObservables = undefined;
    })

    return this.geocodingObservables;
  }
}
