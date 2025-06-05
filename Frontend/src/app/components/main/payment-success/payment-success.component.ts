import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { TicketComponent } from '../ticket/ticket.component';
@Component({
  selector: 'app-payment-success',
  imports:[TicketComponent],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  reservationId: any;
  bookingInfo: any;
  flightInfo:any;

  constructor(private route: ActivatedRoute, private bookingService: BookingService) {}

  printTicket(){

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.reservationId = params['id'];
      console.log("Extracted Reservation ID:", this.reservationId);

      this.bookingService.getBookingInformation(this.reservationId).subscribe({
        next: (data: any) => {
          console.log(data);
          this.bookingInfo = data;
          this.flightInfo = data.flight;
          console.log("Booking Info:", this.bookingInfo);
        },
        error: (err) => {
          console.error("Error fetching booking info:", err);
        }
      });
    });
  }
}