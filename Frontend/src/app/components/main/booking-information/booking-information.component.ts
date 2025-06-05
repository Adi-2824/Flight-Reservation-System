// import { Component, OnInit ,inject} from '@angular/core';
// import { BookingService } from '../../../services/booking.service';
// import { ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-booking-information',
//   imports: [],
//   templateUrl: './booking-information.component.html',
//   styleUrl: './booking-information.component.css'
// })
// export class BookingInformationComponent implements OnInit {
//    bookingService = inject(BookingService);
//   route = inject(ActivatedRoute);
//   bookingId!: number;
//   bookingData: any;

//    ngOnInit() {
//     this.bookingId = Number(this.route.snapshot.paramMap.get('id')); // Get ID from URL
//     if (this.bookingId) {
//       this.fetchBookingDetails();
//     }
//   }

//    fetchBookingDetails() {
//     this.bookingService.getBookingInformation(this.bookingId).subscribe({
//       next: (data: any) => {
//         console.log("Booking Details:", data);
//         this.bookingData = data;
//       },
//       error: (err) => {
//         console.error("Error fetching booking details:", err);
//       }
//     });
//   }


// }


import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { CommonModule } from '@angular/common';

enum PaymentMethod {
  CreditCard = 0,
  DebitCard = 1
}

enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3
}
enum SeatClass {
  Economy = 0,
  Business = 1
}


@Component({
  selector: 'app-booking-information',
  imports:[CommonModule],
  templateUrl: './booking-information.component.html',
  styleUrls: ['./booking-information.component.css']
})

export class BookingInformationComponent implements OnInit {


  bookingService = inject(BookingService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  bookingId!: number;
  bookingData: any;

  ngOnInit() {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id')); // Get ID from URL
    if (this.bookingId) {
      this.fetchBookingDetails();
    }
  }

  fetchBookingDetails() {
    this.bookingService.getBookingInformation(this.bookingId).subscribe({
      next: (data: any) => {
        console.log("Booking Details:", data);
           const departureTime = new Date(data.flight.departureDateTime);
      const currentTime = new Date();
      const hoursUntilDeparture = (departureTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);


        this.bookingData = {
          ...data,
           status: data.status ?? 0, 
           expiresAt: data.expiresAt ? new Date(data.expiresAt + "Z") : null,
          payment: {
            paymentMethod: this.getPaymentMethod(data.payment?.paymentMethod ?? -1),  // Pass -1 for unknown values
          status: this.getPaymentStatus(data.payment?.status ?? -1)
        },
        passengers: data.passengers?.map((passenger:{ firstName: string; lastName: string; seatClass: number})=> ({
          ...passenger,
          seatClass: this.getSeatClass(passenger.seatClass ?? -1)
        })) ?? [],
          canCancel: data.status === 1 && hoursUntilDeparture > 24 // ✅ Only allow cancellation if >1 day before departure
      

        };
      },
      error: (err) => {
        console.error("Error fetching booking details:", err);
      }
    });
  }

  calculateCanCancel(booking: any): boolean {
  if (!booking.flight) return false;
  
  const departureTime = new Date(booking.flight.departureDateTime);
  const currentTime = new Date();
  const hoursUntilDeparture = (departureTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

  return booking.status === 1 && hoursUntilDeparture > 24; // ✅ Allow cancellation if >1 day before departure
}

   getPaymentMethod(value: number): string {
    return  PaymentMethod[value] ?? "Not Provided";

  }

  getPaymentStatus(value: number): string {
    return PaymentStatus[value] ?? "Pending";

  }

  getSeatClass(value: number): string {
  return SeatClass[value] ?? "Unknown";
}


  goBack() {
    this.router.navigate(['/booking-history']); // Navigate back to booking history
  }

 getExpirationCountdown(expirationTime: Date | null): string {
  if (!expirationTime) {
      this.bookingData.status = 2;
    return "Reservation Expired"; // ✅ Handles missing values
  }

  const now = new Date(); // ✅ Local time
  const expiresLocal = expirationTime.toLocaleString(); // ✅ Convert UTC to local

  console.log(`Now: ${now}, Expires At (Local): ${expiresLocal}`); // ✅ Debugging

  const timeLeft = expirationTime.getTime() - now.getTime();

  if (timeLeft <= 0) {
      this.bookingData.status = 2; 
    return "Reservation Expired";
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return `${minutes}m ${seconds}s remaining`;
}
cancelReservation() {
  this.bookingService.cancelReservation(this.bookingId).subscribe({
    next: (res) => {
       console.log("Backend Response:", res); // ✅ Log response for debugging
      console.log("Refund Amount:", this.bookingData.refundAmount);
console.log("Booking Status:", this.bookingData.status);

      if (res.refundAmount > 0) {
          this.bookingData.status = res.refundAmount > 0 ? "Refunded" : "Cancelled"; // ✅ Update status on frontend
      this.bookingData.refundAmount = res.refundAmount ?? 0; // ✅ Ensure refundAmount is displayed correctly


        alert(`Reservation cancelled successfully. Refund Amount: $${res.refundAmount}`);
      } else {
        alert("Reservation cancelled successfully. No refund is applicable.");
      }
      this.fetchBookingDetails(); // ✅ Refresh UI after cancellation
    },
    error: (err) => {
      alert(err.message || "Cancellation failed. Please check the refund policy.");
      console.error("Error cancelling reservation:", err);
    }
  });
}

  proceedToPayment(){
  console.log("Proceeding to payment for booking ID:", this.bookingId);

     this.router.navigate(['/payment',this.bookingId]);
  }
}
