import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerBookingService {
  
  constructor(private http:HttpClient) { }
  bookaticket(data:any,email:String){
    return this.http.post("http://localhost:8081/cb?email="+email,data);
    
    
  }
  deletbk(num:any){
    return this.http.delete("http://localhost:8081/cb?bk="+num);
    
    
  }

  
}
