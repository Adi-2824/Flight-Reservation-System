import { Routes } from '@angular/router';
import { HomeComponent } from './components/main/home/home.component';
import { SearchComponent } from './components/main/search/search.component';
import { ScheduleComponent } from './components/dashboards/schedule/schedule.component';
import { AddFlightComponent } from './components/dashboards/add-flight/add-flight.component';
import { EditairlineComponent } from './components/dashboards/editairline/editairline.component';
import { BookingComponent } from './components/main/booking/booking.component';
import { DashboardComponent } from './components/dashboards/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/main/login/login.component';
import { RegisterComponent } from './components/main/register/register.component';
import { MainComponent } from './components/main/main/main.component';
import { DashMainComponent } from './components/dashboards/dash-main/dash-main.component';
import { BookingConfirmationComponent } from './components/main/booking-confirmation/booking-confirmation.component';
import { PaymentComponent } from './components/main/payment/payment.component';
import { BookingHistoryComponent } from './components/main/booking-history/booking-history.component';
import { PaymentSuccessComponent } from './components/main/payment-success/payment-success.component';
import { BookingInformationComponent } from './components/main/booking-information/booking-information.component';
import { AboutComponent } from './components/main/about/about.component';
import { ContactComponent } from './components/main/contact/contact.component';

export const routes: Routes = [
{path:'',component:MainComponent,children:[
    {path:'',component:HomeComponent},
    {path:"about",component:AboutComponent},
    {path:"contact",component:ContactComponent},
    {path:'search',component:SearchComponent},
    { path: 'home/booking/:flightNumber', component: BookingComponent },
    {path:"dashboard/login",component:LoginComponent},
 {path:"dashboard/register",component:RegisterComponent},
 {path:"booking-confirmation/:flightId",component:BookingConfirmationComponent},
 {path:"payment/:id",component:PaymentComponent},
 {path:'payment-success/:id',component:PaymentSuccessComponent},
 {path:'booking-information/:id', component:BookingInformationComponent},
 {path:"booking-history",component:BookingHistoryComponent}
]},
 {path:'dashboard',component:DashMainComponent,canActivate:[authGuard],children:[

{path:'',component:DashboardComponent},
{path:'dashboard/editFlight/:flightNumber',component:EditairlineComponent},
 {path:'addFlight',component:AddFlightComponent},
 { path: 'dashboard/schedule', component: ScheduleComponent },
  {path:"dashboard/login",component:LoginComponent},
 {path:"dashboard/register",component:RegisterComponent}
 ]},

// { path: 'home/booking/manage', component: ManageComponent },
];
