// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import {jwtDecode} from 'jwt-decode';
// import { tap } from 'rxjs';
// @Injectable({
//   providedIn: 'root'
// })
 
 
// export class AuthService {
 
//   // https://localhost:7035/api/Auth/login
//   private API_URL = 'https://localhost:7035/api';
//   userData:any;
//   constructor(private http: HttpClient) { }
 
//   signUp(user: any): Observable<any> {
//     return this.http.post(`${this.API_URL}/Auth/register`, user);
//   }
 
//   signIn(user: any): Observable<any> {
//     this.userData = user;
//     console.log("🚀 Sending CAPTCHA Token:", user.captchaToken); // ✅ Debug Log
 
 
//     return this.http.post(`${this.API_URL}/Auth/login`, user).pipe(
//       tap((response: any) => {
//       this.userData = response; // ✅ Assign user data
//       console.log(this.userData);
//       localStorage.setItem('userData', JSON.stringify({
//         firstName:response.user.firstName,
//         lastName:response.user.lastName,
//         token:response.token,
//       ]role: response.user.role
//       })); // ✅ Store it persistently
//     })
//     );
//   }
 
//   signOut() {
//     localStorage.removeItem('token');
//   }
 
//   getUserName(): string {
//   const userData = JSON.parse(localStorage.getItem('userData') || '{}');
//   console.log(userData);
//   const firstName = userData?.firstName ;
//   const lastName = userData?.lastName || '';
//   console.log(firstName);
//   return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;
// }
 
 
 
//   getUserData(){
//      if (!this.userData) {
//     this.userData = JSON.parse(localStorage.getItem('userData') || '{}'); // ✅ Retrieve from LocalStorage
//   }
//   console.log("Retrieved User Data:", this.userData);
//   return this.userData;
//   }
 
//   getToken(){
//     return localStorage.getItem('token');
//   }
 
//   dataFromToken(){
//     const token = this.getToken();
//     if(token){
//       var decodedToken = jwtDecode(token) as  Record<string, string>;
//          console.log("Decoded Token:", decodedToken);
 
//         var userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
//             console.log("Extracted User Role:", userRole);
 
//         return userRole;
//       }
//       else{
//         return "";
//       }
//       }
 
//     getCaptcha(){
//        return this.http.get(`${this.API_URL}/captcha/generate`);
//     }
//   }
import { Injectable, signal } from "@angular/core"
import { Router } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable } from "rxjs"
import { tap } from "rxjs/operators"
import { jwtDecode } from "jwt-decode"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly TOKEN_KEY = "token"
  private readonly USER_DATA_KEY = "userData"
  private readonly API_URL = "https://localhost:7035/api"

  // Using BehaviorSubject for better compatibility
  private authStateSubject = new BehaviorSubject<boolean>(this.isAuthenticated())
  public authState$ = this.authStateSubject.asObservable()

  // Alternative signal-based approach
  authStateSignal = signal<boolean>(this.isAuthenticated())

  // User data storage
  userData: any

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Initialize userData from localStorage if available
    this.userData = this.getUserDataFromStorage()
  }

  /**
   * Sign up user
   * @param user User registration data
   * @returns Observable<any>
   */
  signUp(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/Auth/register`, user)
  }

  /**
   * Sign in user with HTTP request
   * @param user Login credentials
   * @returns Observable<any>
   */
  signIn(user: any): Observable<any> {
    this.userData = user
    return this.http.post(`${this.API_URL}/Auth/login`, user).pipe(
      tap((response: any) => {
        this.userData = response
        
        // Store token and user data
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token)
        }
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(response))
        
        // Update auth state
        this.authStateSubject.next(true)
        this.authStateSignal.set(true)
      })
    )
  }

  /**
   * Sign in with token directly (for your original implementation)
   * @param token JWT token
   */
  signInWithToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    this.authStateSubject.next(true)
    this.authStateSignal.set(true)
  }

  /**
   * Sign out user and remove token
   */
  signOut(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_DATA_KEY)
    this.userData = null
    this.authStateSubject.next(false)
    this.authStateSignal.set(false)
  }

  /**
   * Get token from local storage
   * @returns string | null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Get current auth state
   * @returns boolean
   */
  getCurrentAuthState(): boolean {
    return this.authStateSubject.value
  }

  /**
   * Refresh auth state (useful for checking token validity)
   */
  refreshAuthState(): void {
    const isAuth = this.isAuthenticated()
    this.authStateSubject.next(isAuth)
    this.authStateSignal.set(isAuth)
  }

  /**
   * Get user data from memory or localStorage
   * @returns any
   */
  getUserData(): any {
    if (!this.userData) {
      this.userData = this.getUserDataFromStorage()
    }
    console.log("Retrieved User Data:", this.userData)
    return this.userData
  }

  /**
   * Get user data from localStorage
   * @returns any
   */
  private getUserDataFromStorage(): any {
    try {
      const userData = localStorage.getItem(this.USER_DATA_KEY)
      return userData ? JSON.parse(userData) : {}
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error)
      return {}
    }
  }

  /**
   * Decode token and extract user role
   * @returns string
   */
  dataFromToken(): string {
    const token = this.getToken()
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as { role: string }
        return decodedToken.role || ""
      } catch (error) {
        console.error("Error decoding token:", error)
        return ""
      }
    }
    return ""
  }

  /**
   * Get user role from token
   * @returns string
   */
  getUserRole(): string {
    return this.dataFromToken()
  }

  /**
   * Get captcha from API
   * @returns Observable<any>
   */
  getCaptcha(): Observable<any> {
    return this.http.get(`${this.API_URL}/captcha/generate`)
  }

  /**
   * Check if token is expired
   * @returns boolean
   */
  isTokenExpired(): boolean {
    const token = this.getToken()
    if (!token) return true

    try {
      const decodedToken = jwtDecode(token) as { exp: number }
      const currentTime = Date.now() / 1000
      return decodedToken.exp < currentTime
    } catch (error) {
      console.error("Error checking token expiration:", error)
      return true
    }
  }

  /**
   * Auto logout if token is expired
   */
  checkTokenAndLogout(): void {
    if (this.isAuthenticated() && this.isTokenExpired()) {
      this.signOut()
      // Optionally redirect to login page
      // this.router.navigate(['/login'])
    }
  }
}