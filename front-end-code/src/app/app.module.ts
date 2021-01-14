import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RegisterComponent } from './register/register.component';
import { RouterModule, Routes, Router } from '@angular/router'; 
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BusBookingComponent } from './bus-booking/bus-booking.component';
import { MyBookingComponent } from './my-booking/my-booking.component';
import {  MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { CarouselComponent } from './carousel/carousel.component';
import { LogoutComponent } from './logout/logout.component';
import {DatePipe} from '@angular/common';



@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    RegisterComponent,
    HomeComponent,
    LoginComponent,
    
    BusBookingComponent,
    MyBookingComponent,
    ChangepasswordComponent,
    CarouselComponent,
    LogoutComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,   BrowserAnimationsModule,
   RouterModule,ReactiveFormsModule,FormsModule,HttpClientModule,MatDatepickerModule,BrowserAnimationsModule,
   BsDatepickerModule.forRoot()
   
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
