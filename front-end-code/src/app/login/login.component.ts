import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { LoginService } from '../login.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
dd:any;
w:any;
 

  constructor(private router: Router,private ls:LoginService,private formBuilder: FormBuilder) { }
  ngOnInit() {
    this.ls.getlogin().subscribe(w=>{
     this.dd=w;
     
    })
    this.loginForm = new FormGroup({
      email:new FormControl('', [Validators.required,Validators.email]),
      password:new FormControl('', [Validators.required])
    });d:this.dd;
    
    
  
}

clickbtn() {
  let count=0;
    for(let i=0;i<this.dd.length;i++){
      if(this.dd[i].email==this.loginForm.get("email").value && this.dd[i].password==this.loginForm.get("password").value){
            count=1;
            localStorage.setItem("i",this.dd[i].name);
            break;
      }
    }
    if(count==1){
      localStorage.setItem("email",this.loginForm.get("email").value);
     
    this.router.navigate(['/Home']);
    }
    else{
      alert("enter valid user name and password");
    }
  }
  
  
}

