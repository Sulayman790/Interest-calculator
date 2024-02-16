import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard';
import { AdminComponent } from './components/admin/admin.component';
import { RateComponent } from './components/rate/rate.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin', component: AdminComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rate', component: RateComponent,
    canActivate: [AuthGuard]
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
