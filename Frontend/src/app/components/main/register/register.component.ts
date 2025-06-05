import { Component, inject } from '@angular/core';
import { ReactiveFormsModule,FormControl,FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  authService = inject(AuthService);
  constructor(private router: Router) {};
   formData:FormGroup= new FormGroup({
    email:new FormControl('',Validators.required),
    username:new FormControl('',Validators.required),
      password:new FormControl('',[Validators.required]),
      firstName:new FormControl('',[Validators.required]),
      lastName:new FormControl('',[Validators.required]),
      phoneNumber:new FormControl('',[Validators.required])
   })
 RegisterControl(){
    let myFormData = this.formData.value;
    console.log(this.formData.value);
    this.authService.signUp(myFormData)
      .subscribe({
        next:(data:any)=>{
          console.log(data);
          this.router.navigate(['dashboard/login']);
        },
        error:(err:any)=>{
          console.log(err);
        }
      })
}
}