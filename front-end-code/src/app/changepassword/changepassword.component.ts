import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { MybookingService } from '../mybooking.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {
  ChangepasswordForm: FormGroup;
  

  constructor(private ls:LoginService,private mb:MybookingService) { }
dd:any;
  ngOnInit() {
    this.ls.getlogin().subscribe(w=>{
      this.dd=w;
  });
  this.ChangepasswordForm = new FormGroup({
   
    password:new FormControl('', [Validators.required]),
    newpassword:new FormControl('',[Validators.required]),
    confirmnewpassword:new FormControl('',[Validators.required] ) 
  });
  }
  changepass(){
    if((this.ChangepasswordForm.get("newpassword").value)==(this.ChangepasswordForm.get("confirmnewpassword").value)){
      for(let i=0;i<this.dd.length;i++){
        if((localStorage.getItem("email")==this.dd[i].email)  &&  (this.dd[i].password==this.ChangepasswordForm.value.password)   ){
          this.mb.changepws(this.ChangepasswordForm.value.newpassword,localStorage.getItem("email") ).subscribe(u=>{
            console.log(this.ChangepasswordForm.value.password);
          });
        }
    }
  }

    else{
      alert("New Password and ConfirmPassword must be same");
    }
  }
}
