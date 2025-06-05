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
    return this.http.post(`${this.API_URL}/Auth/login`, user).pipe(
      tap((response: any) => {
      this.userData = response; // ✅ Assign user data
      localStorage.setItem('userData', JSON.stringify(response)); // ✅ Store it persistently
    })
    );
  }
  
  signOut() {
    localStorage.removeItem('token');
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
      var decodedToken = jwtDecode(token) as{
        "role": string;};
        var userRole = decodedToken["role"];
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