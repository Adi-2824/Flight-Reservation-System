import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { FlightsService } from '../../../services/flights.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-schedule',
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {
  scheduleForm:FormGroup;
  scheduleList:any= [];

  constructor(private flightService:FlightsService, private router:Router){
    this.scheduleForm= new FormGroup({
      airlineName: new FormControl(''),
      flightNumber: new FormControl(''),
      departureCity: new FormControl(''),
      arrivalCity: new FormControl(''),
      // frequency: new FormControl(''),
      departureTime:new FormControl(''), 
      arrivalTime:new FormControl(''), 
      // aircraftRegistration:new FormControl(''), 
      // seatCount:new FormControl(''), 
      // ticketPrice: new FormControl(''),
      // flightId:new FormControl('')
    })
  }

  // 

  ngOnInit():void{
    this.flightService.getFlights()
    .subscribe({
      next:(data:any)=>{
        console.log(data);
        this.scheduleList=data.$values;
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }

  onEdit(flightId: any): void {
    this.router.navigate(['dashboard/dashboard/editFlight', flightId]); // Redirect to Edit Page with Flight ID
  }

  onDelete(flightNumber:any):void{
    console.log(flightNumber);
      if (confirm('Are you sure you want to delete this flight schedule?')) {
        this.flightService.deleteFlights(flightNumber).subscribe({
          next:(data:any)=>{
            this.scheduleList = this.scheduleList.filter((flight: any) => flight.FlightNumber !== flightNumber);
            console.log(data);
            alert('Flight schedule deleted successfully!');
          },
          error:(err)=>{
            console.log(err);
          }
        })
      }
    }
  }

  // .subscribe(
  //   () => {
  //     // ✅ Remove the deleted flight from the schedule list
  //    
  //   },
  //   (error) => {
  //     console.error('Error deleting flight schedule:', error);
  //     alert('Failed to delete flight schedule. Please try again.');
  //   }
  // );