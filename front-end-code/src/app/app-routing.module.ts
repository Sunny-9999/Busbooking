
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BusBookingComponent } from './bus-booking/bus-booking.component';
import { MyBookingComponent } from './my-booking/my-booking.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { LogoutComponent } from './logout/logout.component';


const routes: Routes = [   {path:'',component:LoginComponent},
  { path:'register', component:RegisterComponent},
                        {path:'Home',component:HomeComponent},
                        {path:'Home/Bus_Booking',component:BusBookingComponent},
                        {path:'Home/My_Booking',component:MyBookingComponent},
                        {path:'Home/Change_Password',component:ChangepasswordComponent},
                        {path:'',component:LogoutComponent}

                     
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
