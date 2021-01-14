import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { getLocaleNumberSymbol } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BusbookingService {

  constructor(private http:HttpClient) {
    
   }
   getbus(){
    return this.http.get("http://localhost:8081/bus");
  }
}
