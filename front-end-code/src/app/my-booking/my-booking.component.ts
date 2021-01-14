import { Component, OnInit } from '@angular/core';
import { MybookingService } from '../mybooking.service';
import { CustomerBookingService } from '../customer-booking.service';
import { DatePipe } from '@angular/common';
const  Swal=require('sweetalert2');
const  Swal1=require('sweetalert2');

@Component({
  selector: 'app-my-booking',
  templateUrl: './my-booking.component.html',
  styleUrls: ['./my-booking.component.css']
})
export class MyBookingComponent implements OnInit {
  book: any;

  constructor(private myb:MybookingService,private delet:CustomerBookingService,private datePipe: DatePipe) { }
dd:any;
temp=[];
num:any;
today:any;
  ngOnInit() {

    var date = new Date();
      this.today= this.datePipe.transform(date,"yyyy-MM-dd");
    
    this.myb.getmybooking().subscribe(w=>{
      this.dd=w;
      
     });
  }
  
 
  
  
  
  



  canceltk(num){
    let count=0;
var k=0;

for(let i=0;i<this.dd.length;i++){
  if(this.dd[i].bookingid==num){
    
  if(this.dd[i].datejrny==this.today ){
    Swal.fire({
      type:'Regret',
      text:'You Cannot cancel Tickets On Date of journy' ,
      title :'Sorry',
      showConfirmButton: true,
    });
  }
  else{
    this.delet.deletbk(num).subscribe((response)=>this.book=response as any);
    Swal1.fire({
      type:'Success',
      text:'Data Deleted Successfully' ,
      title :'Success',
      showConfirmButton: true,
    });
   
  }
}
}



  }
  mybook(){
    let k=0;
    for(let i=0;i<this.dd.length;i++){
      if(this.dd[i].email==localStorage.getItem("email")){
        this.temp[k]=this.dd[i];
        
        
        k++;
       
      }
    }
  }

}
