import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, share} from "rxjs";

export interface IForecastData {
  time: string[],
  temperature2m_max: number[],
  temperature2m_min: number[],
  temperature2m: number[],
  weather_code: number[],
  wind_speed10m: number[],
}

export interface IForecastUnits {
  temperature2m: string,
  wind_speed10m: number[]
}

export interface IForecast {
  latitude: number,
  longitude: number,
  elevation: number,
  timezone: string,
  timezone_abbreviation: string,
  hourly: IForecastData,
  hourly_units: IForecastUnits,
  daily: IForecastData,
  minutely15: IForecastData,
  minutely15_units: IForecastUnits
}

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private token: string;
  private httpClient: HttpClient;
  private forecastObservable: Observable<IForecast> | undefined = undefined;

  constructor(httpClient: HttpClient) {
    this.token = window.localStorage.getItem('token') as string;
    this.httpClient = httpClient;
  }

  refreshToken() {
    this.token = window.localStorage.getItem('token') as string;
  }

  clearCache() {
    this.forecastObservable = undefined;
  }

  saveForecast(forecast: IForecast): Observable<void> {
    return this.httpClient.post<void>('http://localhost:8080/api/forecast', forecast, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    }).pipe(share());
  }

  getForecast(latitude: number, longitude: number): Observable<IForecast> {
    if(this.forecastObservable) return this.forecastObservable;

    let config = {
      params: new HttpParams().set('latitude', latitude.toString()).set('longitude', longitude.toString()),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }

    this.forecastObservable = this.httpClient.get<IForecast>(`http://localhost:8080/api/forecast`, config).pipe(share());

    this.forecastObservable.subscribe((forecast) => {
      this.forecastObservable = undefined;
    });

    return this.forecastObservable;
  }
}
