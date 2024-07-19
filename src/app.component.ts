import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {Route, Router, RouterLink, RouterOutlet} from '@angular/router';
import {IUser, UserService} from "./services/user.service";
import {NgIf} from "@angular/common";
import {RoleService} from "./services/role.service";
import {GeocodingService} from "./services/geocoding.service";
import {ForecastService} from "./services/forecast.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  providers: [UserService, GeocodingService, RoleService, ForecastService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gestionalecorsi';
  @Output() loggedInUser: IUser | undefined = undefined;
  public isAdmin: boolean = false;
  private userService: UserService;
  private roleService: RoleService;
  private forecastService: ForecastService;
  private geocodingService: GeocodingService;
  private router: Router;

  constructor(userService: UserService, router: Router, forecastService: ForecastService, geocodingService: GeocodingService, roleService: RoleService) {
    this.userService = userService;
    this.roleService = roleService;
    this.forecastService = forecastService;
    this.geocodingService = geocodingService;
    this.router = router;

    this.loginHandler = this.loginHandler.bind(this);
    this.logoutHandler = this.logoutHandler.bind(this);
  }

  loginHandler() {
    console.info("Logged in.");
    this.userService.clearCache();
    this.userService.refreshToken();
    this.geocodingService.clearCache();
    this.geocodingService.refreshToken();
    this.forecastService.clearCache();
    this.forecastService.refreshToken();
    this.roleService.clearCache();
    this.roleService.refreshToken();

    this.userService.getUsersMe().subscribe((user) => {
      this.loggedInUser = user;

      this.roleService.getRoles().subscribe((roles) => {
        console.info(roles);
        let adminRoleIds = roles.filter((role) => role.type == "ADMIN").map((role) => role.id);
        this.isAdmin = user.roleIds.some((roleId) => adminRoleIds.includes(roleId));
      });
    });
  }

  logoutHandler() {
    console.info("Logged out.");
    this.userService.clearCache();
    this.userService.refreshToken();

    this.router.navigateByUrl("/");
    this.isAdmin = false;
  }

  ngOnInit() {

    window.addEventListener("login", this.loginHandler);
    window.addEventListener("logout", this.logoutHandler);

    this.loginHandler();
  }

  ngOnDestroy() {
    window.removeEventListener("login", this.loginHandler);
    window.removeEventListener("logout", this.logoutHandler);
  }

  logout($event: MouseEvent) {
    window.localStorage.removeItem('token');
    this.loggedInUser = undefined;
    window.dispatchEvent(new CustomEvent("logout"));
  }
}
