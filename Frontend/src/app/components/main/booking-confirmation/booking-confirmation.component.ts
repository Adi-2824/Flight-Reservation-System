import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-booking-confirmation',
  imports:[CommonModule, ReactiveFormsModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.css']
})
export class BookingConfirmationComponent {
  flightDetails: any;
  travellerList: any[] = [];
  FlightId:any;
  bookingId:any;
  id:any;
  totalAmount :any;
  isEditing = false; // ✅ Track editing state
  editIndex!: number; 
  route = inject(ActivatedRoute);
  bookingService = inject(BookingService);
  router = inject(Router);

  travellerForm:any;
  

  constructor() {
     this.travellerForm = new FormGroup({
    id: new FormControl(null),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl(''),
    gender: new FormControl(''),
    seatClass: new FormControl('Economy')
  });

    this.route.params.subscribe(params => {
    this.FlightId = params['flightId'];

    this.bookingService.getBookingInformation(this.FlightId).subscribe({
      next: (data: any) => {
        console.log(data);
        this.id = data.id; // ✅ Save reservation ID
        this.bookingId = data.bookingReference;
        this.flightDetails = data.flight;
        this.travellerList = data.passengers; // ✅ Load passengers list
        this.totalAmount = data.totalAmount;

 // ✅ Prefill the form with the first passenger's data by default
        if (this.travellerList.length > 0) {
          this.travellerForm.patchValue(this.travellerList[0]);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  });
}

  



  getSeatClassLabel(value: number): string {
  const seatClassMap: Record<number, string> = {
    0: 'Economy',
    1: 'Business'
  };
  return seatClassMap[value] || 'Unknown'; // Handle unexpected values
}
calculateTotalFare(): number {
  return this.travellerList.reduce((total, traveller) => total + traveller.price, 0);
}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.FlightId = params['flightId'];
      this.bookingService.getBookingInformation(this.FlightId).subscribe({
        next: (data: any) => {
          console.log(data);
          this.id= data.id;
          this.bookingId = data.bookingReference;
          console.log(this.bookingId);
          this.flightDetails = data.flight;
          this.travellerList = data.passengers;
          this.totalAmount = data.totalAmount
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  }

  editPassenger(traveller: any, index:number) {
    console.log(traveller);
  this.travellerForm.patchValue({
    id: index, // ✅ Ensure passenger ID is set
    firstName: traveller.firstName,
    lastName: traveller.lastName,
    age: traveller.age,
    gender: traveller.gender,
    seatClass: traveller.seatClass
  });

  this.isEditing = true; // ✅ Track editing mode

  console.log(this.travellerForm.value);
}

updatePassenger() {
   const genderValue = this.travellerForm.get('gender')?.value;
  const seatClassValue = this.travellerForm.get('seatClass')?.value;

  // ✅ Convert gender and seatClass to correct enum format
  const formattedGender = genderValue === 'Male' ? 0 : genderValue === 'Female' ? 1 : null;
  const formattedSeatClass = seatClassValue === 'Economy' ? 0 : seatClassValue === 'Business' ? 1 : null;


  const updatedPassenger = {
    id: this.travellerForm.get('id')?.value, // ✅ Ensure ID is included
    firstName: this.travellerForm.get('firstName')?.value,
    lastName: this.travellerForm.get('lastName')?.value,
    age: this.travellerForm.get('age')?.value,
    gender: formattedGender,
    seatClass: formattedSeatClass
  };

  console.log("Updating Passenger:", updatedPassenger);
    console.log("Sending Passenger Update Request:", updatedPassenger);


  if (updatedPassenger.id===undefined) {
    alert("Cannot update passenger: ID is missing.");
    return;
  }
  console.log(this.FlightId);
  this.bookingService.updatePassenger(this.FlightId, updatedPassenger).subscribe({
    next: () => {
      alert("Passenger updated successfully!");
      
      this.travellerList = this.travellerList.map(passenger =>
        passenger.id === updatedPassenger.id ? updatedPassenger : passenger
      ); // ✅ Ensure correct passenger entry is updated

      this.isEditing = false;
      this.travellerForm.reset();
    },
    error: (err) => {
      console.error("Error updating passenger:", err);
      alert("Failed to update passenger. Please try again.");
    }
  });
}


  proceedToPayment() {
    this.router.navigate(['/payment',this.id]);
  }
}