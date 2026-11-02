
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RiderDashboardComponent } from './components/rider-dashboard/rider-dashboard.component';
import { DriverDashboardComponent } from './components/driver-dashboard/driver-dashboard.component';
import { RideTrackingComponent } from './components/ride-tracking/ride-tracking.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'rider-dashboard', component: RiderDashboardComponent },
  { path: 'driver-dashboard', component: DriverDashboardComponent },
  { path: 'ride-tracking', component: RideTrackingComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
