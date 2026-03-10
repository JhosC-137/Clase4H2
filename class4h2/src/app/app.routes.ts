import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginVRComponent } from './login-vr/login-vr.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-vr', component: LoginVRComponent }
];
