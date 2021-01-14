import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MybookingService {

  constructor(private http:HttpClient) { }
  getmybooking() {
    return this.http.get("http://localhost:8081/cb");
  }
 changepws(data:any,email:String ){
   return this.http.put(( "http://localhost:8081/changepassword/"+email),data);
 }
 
 updatebus(temp:any,bus_id:any){
  return this.http.post(( "http://localhost:8081/bus_id/"+bus_id),temp);
}

}
