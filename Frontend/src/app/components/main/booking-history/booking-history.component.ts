import { Component, inject } from '@angular/core';
import { BookingService } from '../../../services/booking.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-booking-history',
  imports: [CommonModule],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.css']
})
export class BookingHistoryComponent {
  bookingService = inject(BookingService);
  router = inject(Router);
  bookingList: any[] = [];
  filteredBookingList: any[] = []; // Data displayed after filtering
  

  ngOnInit() {
      this.checkExpiredReservations(); 
    this.fetchAllReservations(); // Load all reservations by default
  }

  checkExpiredReservations() {
  this.bookingService.checkExpiredReservations().subscribe({
    next: (res: any) => {
      console.log(res);
      console.log(`Expired reservations updated: ${res.updatedCount}`);
    },
    error: (err) => {
      console.error("Error checking expired reservations:", err);
    }
  });
}

  filterBookings(type: string) {
  const now = new Date();

  if (type === 'all') {
    this.filteredBookingList = [...this.bookingList]; // Show all reservations
  } else if (type === 'upcoming') {
    this.filteredBookingList = this.bookingList.filter(
      (booking) => new Date(booking.flight.departureDateTime) > now
    );
  } else if (type === 'past') {
    this.filteredBookingList = this.bookingList.filter(
      (booking) => new Date(booking.flight.departureDateTime) < now
    );
  }

  console.log(`Filtered ${type} journeys:`, this.filteredBookingList);
}
  fetchAllReservations() {
    this.bookingService.getUserBookings().subscribe({
      next: (data: any) => {
        console.log("All Reservations:", data);
        this.bookingList = this.formatBookings(data);
        this.filteredBookingList = [...this.bookingList]; // Show all reservations initially
      },
      error: (err) => {
        console.error("Error fetching reservations:", err);
      }
    });
  }

  fetchUpcomingJourneys() {
    this.bookingService.getUpcomingJourneys().subscribe({
      next: (data: any[]) => {
        console.log("Upcoming Journeys:", data);
        this.filteredBookingList = this.formatBookings(data);
      },
      error: (err) => {
        console.error("Error fetching upcoming journeys:", err);
      }
    });
  }

  fetchPastJourneys() {
    this.bookingService.getPastJourneys().subscribe({
      next: (data: any[]) => {
        console.log("Past Journeys:", data);
        this.filteredBookingList = this.formatBookings(data);
      },
      error: (err) => {
        console.error("Error fetching past journeys:", err);
      }
    });
  }

  formatBookings(data: any[]): any[] {
    return data.map(booking => ({
      ...booking,
      bookingDate: booking.bookingDate ? new Date(booking.bookingDate) : 'N/A',
      flight: {
        ...booking.flight,
        departureDateTime: booking.flight.departureDateTime ? new Date(booking.flight.departureDateTime) : 'N/A',
        arrivalDateTime: booking.flight.arrivalDateTime ? new Date(booking.flight.arrivalDateTime) : 'N/A',
      },
      passengers: booking.passengers ?? []
    }));
  }

  moreDetails(id:number) {
    console.log("Show more details logic here");
    this.router.navigate(["/booking-information",id]);
  }
}

// import { Component, inject } from '@angular/core';
// import { BookingService } from '../../../services/booking.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-booking-history',
//   imports: [CommonModule],
//   templateUrl: './booking-history.component.html',
//   styleUrls: ['./booking-history.component.css']
// })
// export class BookingHistoryComponent {
//   bookingService = inject(BookingService);
//   bookingList: any[] = []; // Original unfiltered data
//   filteredBookingList: any[] = []; // Data displayed after filtering

//   ngOnInit() {
//     this.fetchBookingHistory(); // Load all bookings by default
//   }

//   fetchBookingHistory() {
//     this.bookingService.getUserBookings().subscribe({
//       next: (data: any) => {
//         console.log("Fetched Data:", data);
//         this.bookingList = this.formatBookings(data);
//         this.filteredBookingList = [...this.bookingList]; // Initially show all reservations
//       },
//       error: (err) => {
//         console.error("Error fetching booking history:", err);
//       }
//     });
//   }

//   formatBookings(data: any[]): any[] {
//     return data.map((booking) => ({
//       ...booking,
//       bookingDate: booking.bookingDate ? new Date(booking.bookingDate) : 'N/A',
//       flight: {
//         ...booking.flight,
//         departureDateTime: booking.flight.departureDateTime ? new Date(booking.flight.departureDateTime) : 'N/A',
//         arrivalDateTime: booking.flight.arrivalDateTime ? new Date(booking.flight.arrivalDateTime) : 'N/A',
//       },
//       passengers: booking.passengers ?? []
//     }));
//   }

//   filterBookings(type: string) {
//     const now = new Date();

//     if (type === 'all') {
//       this.filteredBookingList = [...this.bookingList]; // Show all reservations
//     } else if (type === 'upcoming') {
//       this.filteredBookingList = this.bookingList.filter(
//         (booking) => new Date(booking.flight.departureDateTime) > now
//       );
//     } else if (type === 'past') {
//       this.filteredBookingList = this.bookingList.filter(
//         (booking) => new Date(booking.flight.departureDateTime) < now
//       );
//     }

//     console.log(`Filtered ${type} journeys:`, this.filteredBookingList);
//   }

//   moreDetails() {
//     console.log("Show more details logic here");
//   }
// }