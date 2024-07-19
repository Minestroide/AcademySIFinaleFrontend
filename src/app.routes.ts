import { Routes } from '@angular/router';
import {PasswordresetComponent} from "./app/passwordreset/passwordreset.component";
import {LoginComponent} from "./app/login/login.component";
import {RegisterComponent} from "./app/register/register.component";
import {HomeComponent} from "./app/home/home.component";
import {ProfileeditComponent} from "./app/profileedit/profileedit.component";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'passwordreset',
    component: PasswordresetComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'profile',
    component: ProfileeditComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  }
];
