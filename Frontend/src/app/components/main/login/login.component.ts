import { Component, inject} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormControl,FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  authService = inject(AuthService);

  constructor(private router: Router) {};

   formData:FormGroup= new FormGroup({
  email:new FormControl('',Validators.required),
  password:new FormControl('',[Validators.required])
})



loginControl(): void {
  let myFormData = this.formData.value;
  console.log("🚀 Form Data Before Sending:", myFormData);

  console.log(myFormData);
  this.authService.signIn(myFormData).subscribe({
    next: (data: any) => {
      console.log("✅ Login Success", data);
      localStorage.setItem("token", data.token);
      this.router.navigateByUrl(data.role === "Admin" ? '/dashboard' : '/home');
    },
    error: (err: any) => {
      console.error("❌ Login Failed", err);
    }
  });
}
}





// refreshCaptcha(){
// this.authService.getCaptcha().subscribe((data: any) => {
//     this.captchaUrl = `data:image/png;base64,${data.image}`; 
//     console.log("CAPTCHA Image URL:", this.captchaUrl);

//     console.log("New CAPTCHA Text:", data.captchaText); 
//   });
// }
//  loginControl(): void {
//   // Add logic to validate user credentials here
//   let myFormData = this.formData.value;
//     console.log(this.formData.value);
//     console.log("Captcha being sent:", this.formData.value.captchaText);

//     if (!myFormData.captchaText) {
//     console.error("🚨 CAPTCHA is missing!");
//     return;
//   }
//     this.authService.signIn(myFormData)
//       .subscribe({
//         next:(data:any)=>{
//           var token = data.token;
//           // localstorage save
//           localStorage.setItem("token",token);
//           console.log(token);
//           console.log("Extracted Role:", this.authService.dataFromToken());
//           if(this.authService.dataFromToken()=="User"){
           
//             this.router.navigateByUrl('/home');
//           }
//           if(this.authService.dataFromToken()=="Admin"){
//             this.router.navigateByUrl('/dashboard')
//           }
//           // else {
//           //   console.error('Login failed:', data.msg);
//           // }
//         },
//         error:(err:any)=>{
//           console.log(err);
//         }
//       })
//   // Navigate to the dashboard
//   // this.router.navigate(['/dashboard/dashboard']);
// }