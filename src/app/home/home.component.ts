import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {GeocodingService, IGeocoding} from "../../services/geocoding.service";
import {ForecastService, IForecast} from "../../services/forecast.service";
import {IUser, UserService} from "../../services/user.service";
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  private router: Router;
  private geocodingService: GeocodingService;
  private forecastService: ForecastService;
  private userService: UserService;

  myForecasts: IForecast[] = [];

  private requestTimeout: any = undefined;

  user: IUser | undefined = undefined;
  geocodings: IGeocoding[] = [];
  geocoding: IGeocoding | undefined = undefined;
  forecast: IForecast | undefined = undefined;

  loading: boolean = false;

  constructor(router: Router, userService: UserService, geocodingService: GeocodingService, forecastService: ForecastService) {
    this.router = router;
    this.geocodingService = geocodingService;
    this.forecastService = forecastService;
    this.userService = userService;

    this.onSubmit = this.onSubmit.bind(this);
  }

  ngOnInit() {
    this.userService.getUsersMe().subscribe((user) => {
      this.user = user;

      console.log(user);

      if(!user) return;

      this.forecastService.getMyForecasts().subscribe((forecasts) => {
        console.log(forecasts);
        this.myForecasts = forecasts;
      });
    });
  }

  protected readonly JSON = JSON;

  public city = new FormControl('');

  weahterCodeToString(weatherCode: number | undefined) {
    console.log(weatherCode);
    if(weatherCode === undefined) return "Unknown";

    return {
      0: 'Clear sky',
      1: 'Nearly clear sky',
      2: 'Variable cloudiness',
      3: 'Halfclear sky',
      4: 'Cloudy sky',
      40: 'Scattered showers',
      45: 'Thunderstorm',
      49: 'Light rain showers',
      50: 'Moderate rain showers',
      51: 'Heavy rain showers',
      53: 'Light snow showers',
      54: 'Moderate snow showers',
      55: 'Heavy snow showers',
      56: 'Snow showers',
      60: 'Light sleet showers',
      61: 'Moderate sleet showers',
      62: 'Heavy sleet showers',
      63: 'Light sleet',
      64: 'Moderate sleet',
      65: 'Heavy sleet',
      66: 'Light snowfall',
      67: 'Moderate snowfall',
      68: 'Heavy snowfall',
      70: 'Light rain',
      71: 'Moderate rain',
      72: 'Heavy rain',
      80: 'Thunder',
      95: 'Fog',
    }[weatherCode as number]
  }

  onSubmit($event: SubmitEvent) {
    $event.preventDefault();

    console.log(this.city.value);

    this.loading = true;

    this.geocodingService.searchGeocodings(this.city.value as string).subscribe((geocodings) => {
      this.geocodings = geocodings;

      if(geocodings.length === 0) {
        this.loading = false;
        this.forecast = undefined;
        return
      }

      this.city.setValue('');

      console.log(geocodings);

      this.forecastService.getForecast(geocodings[0].latitude, geocodings[0].longitude).subscribe((forecast) => {
        this.loading = false;
        this.forecast = forecast
      });
    });
  }

  sendToDb($event: MouseEvent) {
    if(!this.geocoding) return;

    this.forecastService.saveForecast(this.forecast as IForecast, this.geocoding?.name).subscribe({
      next: () => {
        this.forecastService.getMyForecasts().subscribe((forecasts) => {
          this.myForecasts = forecasts;
        });
      },
      error: (error) => {
        alert('Failed to save forecast to database');
      }
    });
  }

  onForecastDelete($event: MouseEvent, id: string | undefined) {
    if(!id) return;

    this.forecastService.deleteForecast(id).subscribe(() => {
      this.forecastService.getMyForecasts().subscribe((forecasts) => {
        this.myForecasts = forecasts;
      });
    })
  }

  chooseGeocoding($event: MouseEvent, geocoding: IGeocoding) {
    this.geocoding = geocoding;
    this.geocodings = [];
  }
}
