import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgForOf} from "@angular/common";
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
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);

  private router: Router;
  private geocodingService: GeocodingService;
  private forecastService: ForecastService;
  private userService: UserService;

  private requestTimeout: any = undefined;

  user: IUser | undefined = undefined;
  geocodings: IGeocoding[] = [];
  forecast: IForecast | undefined = undefined;

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
    });
  }

  protected readonly JSON = JSON;

  public city = new FormControl('');

  onSubmit($event: SubmitEvent) {
    $event.preventDefault();

    console.log(this.city.value);

    this.geocodingService.searchGeocodings(this.city.value as string).subscribe((geocodings) => {
      this.geocodings = geocodings;

      this.city.setValue('');

      console.log(geocodings);

      this.forecastService.getForecast(geocodings[0].latitude, geocodings[0].longitude).subscribe((forecast) => {
        this.forecast = forecast
      });
    });
  }
}
