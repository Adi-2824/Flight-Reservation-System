import { Component, inject, OnInit} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone:true,
  imports: [RouterLink,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  authService = inject(AuthService);
  router = inject(Router);
  isLoggedIn :boolean = false

  checkLoginStatus(){
    const token = this.authService.getToken();
    this.isLoggedIn = !!token;
  }
  ngOnInit(){
    this.checkLoginStatus();
    
  }
 OnLogout() {
    // Perform logout logic here
    console.log('User logged out');
    this.isLoggedIn = false;
    this.authService.signOut()
    this.router.navigate(['/dashboard/login']);
  }
}
