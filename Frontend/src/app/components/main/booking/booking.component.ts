import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightsService } from '../../../services/flights.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import Swal from 'sweetalert2';

enum Gender {
  Male = 0,
  Female = 1
}

enum SeatClass {
  Economy = 0,
  Business = 1
}

@Component({
  selector: 'app-booking',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent {
  travellerList:any[] =[];
  flightDetails:any;
  tripDetails:any;
  flightNumber:any;
  flightService = inject(FlightsService)
  route = inject(ActivatedRoute);
  router = inject(Router);
  bookingService = inject(BookingService);
  bookingId:any;
  isEditing:any;

  travellerForm :FormGroup;
  constructor(){
    this.travellerForm = new FormGroup({
      id: new FormControl(''),
      firstName: new FormControl('',Validators.required),
      lastName: new FormControl('',Validators.required),
      seatClass: new FormControl('Economy'),
      age: new FormControl(''),
      gender: new FormControl('')
    })
  }
  getSeatClassLabel(value: number): string {
  const seatClassMap: Record<number, string> = {
    0: 'Economy',
    1: 'Business'
  };
  return seatClassMap[value] || 'Unknown'; 
  }

  ngOnInit(): void {
    this.travellerList=[];
      this.route.params.subscribe(params=>{
        this.flightNumber=params['flightNumber'];

        this.flightService.getFlightByFlightNumber(this.flightNumber).subscribe({
            next:(data:any)=>{
              console.log(data);
             this.flightDetails = data;
             console.log(this.flightDetails);
            },
            error:(err)=>{
              console.log(err);
            }
        })
      })
    }

    calculateTotalFare(): number {
  return this.travellerList.reduce((total, traveller) => total + traveller.price, 0);
}

  addTraveller(){
    if(this.travellerForm.invalid){
      return;
    }
    const seatClass = this.travellerForm.get('seatClass')?.value;
  const price = seatClass === 'Economy' ? this.flightDetails.economyPrice : this.flightDetails.businessPrice;


    const newTraveller ={
    id:this.travellerList.length,
    firstName: this.travellerForm.get('firstName')?.value,
    lastName: this.travellerForm.get('lastName')?.value,
    seatClass: SeatClass[this.travellerForm.get('seatClass')?.value as keyof typeof SeatClass],
    price:price,
    age:this.travellerForm.get('age')?.value ,
    gender:Gender[this.travellerForm.get('gender')?.value as keyof typeof Gender]
    }
     console.log("New Traveller Added:", newTraveller); 
    this.travellerList.push(newTraveller);
     console.log(this.travellerList);

    this.travellerForm.reset();
  }

  ProceedToBooking(){
    console.log(this.travellerList);
    this.bookingService.bookTickets(this.flightNumber,this.travellerList)
    .subscribe({
      next:(data:any)=>{
        console.log(data);
        this.bookingId = data.id;
        Swal.fire({
        title: 'Booking Confirmed!',
        text: 'Redirecting to the confirmation page...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/booking-confirmation', this.bookingId]); // Redirect after alert
      });
      },

      error:(err)=>{
        console.log(err);
      }
    })
  }
//   editPassenger(traveller: any) {
//   this.travellerForm.patchValue({
//     id:traveller.id,
//     firstName: traveller.firstName,
//     lastName: traveller.lastName,
//     seatClass: this.getSeatClassLabel(traveller.seatClass),
//     age: traveller.age,
//     gender: traveller.gender
//   });

//   this.isEditing = true; // ✅ Set editing mode
//   }

// updatePassenger() {
//   const updatedPassenger = {
//     id: this.travellerForm.get('id')?.value, // ✅ Ensure ID matches index
//     firstName: this.travellerForm.get('firstName')?.value,
//     lastName: this.travellerForm.get('lastName')?.value,
//     seatClass: SeatClass[this.travellerForm.get('seatClass')?.value as keyof typeof SeatClass],
//     age: this.travellerForm.get('age')?.value,
//     gender: Gender[this.travellerForm.get('gender')?.value as keyof typeof Gender]
//   };

//   console.log(updatedPassenger);
//   this.bookingService.updatePassenger(this.bookingId,updatedPassenger).subscribe({
//     next: () => {
//       alert("Passenger updated successfully!");
//         this.travellerList = this.travellerList.map((traveller, index) =>
//         index === updatedPassenger.id ? updatedPassenger : traveller
//       );
//        this.isEditing = false; 
//       this.travellerForm.reset();
//     },
//     error: (err) => {
//       console.error("Error updating passenger:", err);
//       alert("Failed to update passenger. Please try again.");
//     }
//   });
// }


}
  

