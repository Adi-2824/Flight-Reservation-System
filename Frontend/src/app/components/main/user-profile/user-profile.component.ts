import { Component, OnInit, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  usersService = inject(AuthService);
  router = inject(Router);
  selectedOption: string = 'userInfo'; // Default to User Information
  userForm: FormGroup;
  changePasswordForm: FormGroup;
  id!: number;

  constructor() {
    this.userForm = new FormGroup({
      id: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phoneNumber: new FormControl(''),
    });
    this.changePasswordForm = new FormGroup({
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  // confirmDeleteUser() {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'This action cannot be undone. If you have active reservations, deletion is restricted.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, Delete',
  //     cancelButtonText: 'No, Keep Account',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.deleteUser();
  //     }
  //   });
  // }
  // deleteUser() {
  //   if (!this.id) {
  //     console.error('User ID is missing!');
  //     Swal.fire({
  //       title: 'User ID Missing!',
  //       text: 'Unable to delete user. Please reload the page and try again.',
  //       icon: 'error',
  //       confirmButtonText: 'OK',
  //     });

  //     return;
  //   }
  //   this.usersService.deleteUser(this.id).subscribe({
  //     next: () => {
  //       Swal.fire({
  //         title: 'Account Deleted!',
  //         text: 'Your account has been successfully deleted.',
  //         icon: 'success',
  //         timer: 2000,
  //         showConfirmButton: false,
  //       }).then(() => {
  //         localStorage.clear(); // ✅ Remove authentication tokens
  //         this.router.navigate(['/home']); // ✅ Redirect user after deletion
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error deleting user:', err);
  //       Swal.fire({
  //         title: 'Deletion Failed!',
  //         text: err.error || 'An error occurred while deleting your account.',
  //         icon: 'error',
  //         confirmButtonText: 'OK',
  //       });
  //     },
  //   });
  // }

  // changeUserPassword() {
  //   if (this.changePasswordForm.valid) {
  //     this.usersService
  //       .changeUserPassword(this.changePasswordForm.value.newPassword)
  //       .subscribe({
  //         next: () => {
  //           alert('Password changed successfully!');
  //           this.changePasswordForm.reset();
  //         },
  //         error: (err) => {
  //           console.error('Error changing password:', err);
  //           alert('Failed to update password.');
  //         },
  //       });
  //   }
  // }

  loadUserData() {
    this.usersService.getUserData().subscribe({
      next: (user: any) => {
        console.log(user);
        if (user) {
          this.id = user.id; // ✅ Explicitly store user ID
          console.log('User ID set:', this.id);
          this.userForm.patchValue({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
          });
        }
      },
      error: (err: any) => {
        console.error('Error fetching user data:', err);
      },
    });
  }

  updateUserInfo() {
    if (this.userForm.valid) {
      this.usersService.updateUserProfile(this.userForm.value).subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully:', updatedUser);
          alert('Profile updated successfully!');
        },
        error: (err) => {
          console.error('Error updating user:', err);
        },
      });
    }
  }
}
