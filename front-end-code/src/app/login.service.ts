import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http:HttpClient) { }
  getlogin() {
    return this.http.get("http://localhost:8081");
  }
  getCountry(){
    return this.http.get("http://localhost:8081/c")
  }
  getcState(data:number){
    return this.http.get("http://localhost:8081/cid/?cid="+data);
  }

}