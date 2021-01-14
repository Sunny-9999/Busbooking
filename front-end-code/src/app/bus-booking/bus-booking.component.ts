import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { BusbookingService } from '../busbooking.service';
import { CustomerBookingService } from '../customer-booking.service';
import { LoginComponent } from '../login/login.component';
import { DatePipe } from '@angular/common';
import { MybookingService } from '../mybooking.service';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap'; 
const  Swal=require('sweetalert2');
const  Swal1=require('sweetalert2');
const  Swal3=require('sweetalert2');
@Component({
  selector: 'app-bus-booking',
  templateUrl: './bus-booking.component.html',
  styleUrls: ['./bus-booking.component.css']
})
export class BusBookingComponent implements OnInit {
  BusBookingForm: FormGroup;
  bb: any;
  submitted= false;
  w:any;
  temp=[];

   cbs:any;
  t=this.temp;
  count1:number;
  constructor(private bbs:BusbookingService,private busbook:CustomerBookingService,private upb:MybookingService) { }
  ngOnInit() {
    this.bbs.getbus().subscribe(w=>{
      this.bb=w;
    });
   
    
   
    this.BusBookingForm = new FormGroup({
      fromd:new FormControl('', [Validators.required]),
      tod:new FormControl('', [Validators.required]),
      datejrny:new FormControl('',[Validators.required]),
      nos:new FormControl('' ) 
    });
}

get f(){
  return this.BusBookingForm.controls;
}
onSubmit() {
  this.submitted = true;
}
bookaticket(bus_id,nop)
{
  if(this.BusBookingForm.get("nos").value>nop){
    Swal3.fire({
      type:'Alert',
      text:'You can only Book  ' +nop +' Seats' ,
      title :'Regret',
      showConfirmButton: true,
    });

  }
  else{
  this.busbook.bookaticket(this.BusBookingForm.value,localStorage.getItem("email")).subscribe(data => {
  });
  
  localStorage.setItem("i",bus_id);
     
  this.upb.updatebus(this.BusBookingForm.get("nos").value,localStorage.getItem("i")).subscribe(data => {
     });
     
     Swal.fire({
      type:'Success',
      text:'Thank you  '+this.BusBookingForm.get("nos").value+'  Seats booked Successfully' ,
      title :'Success',
      showConfirmButton: true,
    });
    
    
  }  

}
searchbtn(){
  
let count=0;
var k=0;
var form1;
var to1;
var date1;
var u;
for(let i=0;i<this.bb.length;i++){
  form1=this.BusBookingForm.get("fromd").value;
  to1=this.BusBookingForm.get("tod").value;
 date1=this.BusBookingForm.get("datejrny").value;
 u=this.bb[i].date;              
  if((this.bb[i].fromd==form1.toLowerCase( ))  &&  (this.bb[i].tod==to1.toLowerCase( )) && (u==date1)  && this.bb[i].nop>0){
    this.temp[k]=this.bb[i];
    k++;
    count=1;
  }
}

if(count=0){
  Swal1.fire({
    type:'Regret',
    text:'No Buses found with ParticularS',
    showConfirmButton: true,
  });

  
}

}
today=new Date();

}
export const getDate = function (date: any): Date {
  const _date = new Date(date);
  return new Date(
    Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate())
  );
};