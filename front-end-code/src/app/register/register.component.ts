import { Component, OnInit, ɵSWITCH_IVY_ENABLED__POST_R3__, ɵSWITCH_TEMPLATE_REF_FACTORY__POST_R3__ } from '@angular/core';
import { FormGroup,FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationService } from '../registration.service';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { constants } from 'os';
const  Swal=require('sweetalert2');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
dd:any;
cc;
  registerForm: FormGroup;
submitted= false;
postdata1:String;
id:any;
  State: any;


constructor(private router: Router,private formBuilder: FormBuilder,private postdata:RegistrationService ,private ls:LoginService) { }

ngOnInit() {
this.registerForm = this.formBuilder.group({
title: ['', Validators.required],
name: ['', Validators.required],
password: ['', Validators.required],
email: ['', [Validators.required, Validators.email]],
dOB: ['', Validators.required],
country: ['', Validators.required],
state: ['', Validators.required],
phone_no:['',Validators.required],
address: ['', Validators.required],
pincode: ['', Validators.required],
acceptTerms: [false, Validators.requiredTrue]
});


this.ls.getCountry().subscribe(c=>{
  this.cc=c;
});

}


get f() { return this.registerForm.controls; }

onSubmit() {
this.submitted = true;



if (this.registerForm.invalid) {
    return;
}

// display form values on success
// this.postdata1="{\"email\" :"+"\""+this.registerForm.value.Email+"\""+","+
//       "\"name\" :"+"\""+this.registerForm.value.Name+"\""+","+
//       "\"password\" :"+"\""+this.registerForm.value.Password+"\""+","+
//      "\"dOB\" :"+"\""+this.registerForm.value.DOB+"\""+","+
//      "\"phone_no\" :"+"\""+this.registerForm.value.Phone_no +"\" "+","+
//      "\"address\" :"+"\""+this.registerForm.value.Address+"\""+","+
//      "\"pincode\":"+"\""+this.registerForm.value.PinCode+"\""+"}";
     
     this.postdata.postdatabk(this.registerForm.value).subscribe(data => {
      this.router.navigate(['/Home']);
      Swal.fire({
        type:'success',
        text:'Account Created Successfully',
        showConfirmButton: true,
      });
      
     }
    );
    
     
  }

  onReset() {
      this.submitted = false;
      this.registerForm.reset();
      window.location.reload();
     
  }
 

getState(){
 
  let country=this.registerForm.value.country;
  localStorage.setItem("i",this.registerForm.value.name);
  let Cid:number;
  for(var j=0;j<this.cc.length;j++){
    if(this.cc[j].cname==country){
      
      Cid=this.cc[j].cid;
      this.ls.getcState(this.cc[j].cid).subscribe(ss=>{
        this.State=ss;
         });
   
  }
}
 
}


}
