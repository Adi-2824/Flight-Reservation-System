import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import { tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})


export class AuthService {
  
  // https://localhost:7035/api/Auth/login
  private API_URL = 'https://localhost:7035/api';
  userData:any;
  constructor(private http: HttpClient) { }

  signUp(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/Auth/register`, user);
  }

  signIn(user: any): Observable<any> {
    this.userData = user;
    console.log("🚀 Sending CAPTCHA Token:", user.captchaToken); // ✅ Debug Log


    return this.http.post(`${this.API_URL}/Auth/login`, user).pipe(
      tap((response: any) => {
      this.userData = response; // ✅ Assign user data
      console.log(this.userData);
      localStorage.setItem('userData', JSON.stringify({
        firstName:response.user.firstName,
        lastName:response.user.lastName,
        token:response.token,
         role: response.user.role 
      })); // ✅ Store it persistently
    })
    );
  }
  
  signOut() {
    localStorage.removeItem('token');
  }

  getUserName(): string {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  console.log(userData);
  const firstName = userData?.firstName ;
  const lastName = userData?.lastName || '';
  console.log(firstName);
  return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;
}



  getUserData(){
     if (!this.userData) {
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}'); // ✅ Retrieve from LocalStorage
  }
  console.log("Retrieved User Data:", this.userData);
  return this.userData;
  }

  getToken(){
    return localStorage.getItem('token');
  }
 
  dataFromToken(){
    const token = this.getToken();
    if(token){
      var decodedToken = jwtDecode(token) as  Record<string, string>;
         console.log("Decoded Token:", decodedToken);

        var userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            console.log("Extracted User Role:", userRole);

        return userRole;
      }
      else{
        return "";
      }
      }

    getCaptcha(){
       return this.http.get(`${this.API_URL}/captcha/generate`);
    }
  }