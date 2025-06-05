import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  imports:[CommonModule,RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  airlineForm: FormGroup;
  airlineList:any[] = [];
  showAddBtn:boolean = true;
 
  constructor(private fb: FormBuilder) {
    this.airlineForm = fb.group({
      id: [''],
      airlineName: ['', Validators.required],
      airlineCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      contactNumber: ['', [Validators.required, Validators.pattern('[- +()0-9]{6,}')]]
    });
   }
 
  ngOnInit(): void {
    // this.getAllAirlines();
  }
 
 

 
  resetForm(){
    this.airlineForm.reset();
    for (let control in this.airlineForm.controls) {
      this.airlineForm.controls[control].setErrors(null);
    }
    this.showAddBtn = true;
  }
  logout(){
   
  }
 
}
 
 