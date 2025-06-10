import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';
import {jwtDecode} from 'jwt-decode';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

export class PaymentComponent implements OnInit {
  constructor(private router: Router, private cdRef: ChangeDetectorRef) {}

  totalAmount: any;
  selectedPaymentMethod: string = '';
  bookingService = inject(BookingService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  bookingInfo: any;
  reservationId: any;
  returnReservationId: any;
  userInfo: any;
  paymentData: any={};
  storeCard: any;
  userEmail:string='';
  paymentService = inject(PaymentService);

  ngOnInit(): void {
    // ✅ Get reservationId from route parameters (not query parameters)
    this.reservationId = this.route.snapshot.paramMap.get('reservationId');
    console.log("reservationId from route params: ", this.reservationId);

    // ✅ Still check for query parameters for returnReservationId if needed
    this.route.queryParams.subscribe(params => {
      this.returnReservationId = params['returnReservationId'];
      console.log("Extracted Return Reservation ID from query params:", this.returnReservationId);
    });

    // ✅ Alternative approach - listen to route parameter changes
    this.route.paramMap.subscribe(params => {
      this.reservationId = params.get('reservationId');
      console.log("reservationId from paramMap subscription: ", this.reservationId);
    });

    // ✅ Retrieve and Decode Token to Extract Email
    const storedUserData = this.authService.getUserData();
    const token = storedUserData?.token;

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userEmail = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        console.log("✅ Extracted User Email from Token:", this.userEmail);
      } catch (error) {
        console.error("❌ Error decoding JWT token:", error);
      }
    } else {
      console.error("❌ No token found in user data!");
    }

    this.userInfo = storedUserData?.user || storedUserData;
  
    // ✅ Retrieve saved card based on extracted email
    if (this.userEmail) {
      const savedCard = JSON.parse(localStorage.getItem(`savedCard_${this.userEmail}`) || "{}");
      if (savedCard.cardNumber) {
        console.log("✅ Found saved card for user:", this.userEmail, savedCard);
        this.paymentData = { ...savedCard, cvv: '' }; // ✅ Ensure CVV is reset
      } else {
        this.paymentData = this.getEmptyCardDetails();
      }
    } else {
      console.error("❌ User email is undefined, cannot retrieve saved card info!");
      this.paymentData = this.getEmptyCardDetails();
    }
    
    this.cdRef.detectChanges();
    
    // ✅ Only fetch booking info if reservationId exists
    if (this.reservationId) {
      this.bookingService.getBookingInformation(this.reservationId)
        .subscribe({
          next: (data: any) => {
            this.bookingInfo = data;
            this.totalAmount = data.totalAmount;
            console.log("Booking Info:", this.bookingInfo);
          },
          error: (err) => {
            console.error("Error fetching booking info:", err);
          }
        });

      const payload = {
        "to": this.userEmail,
        "subject": 'Booking Confirmed',
        "body": "The booking is confirmed",
      }
      console.log(payload);
      this.bookingService.sendEmail(payload).subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      console.error("❌ No reservationId found in route parameters!");
    }
  }

  getEmptyCardDetails() {
    return {
      cardHolderName: `${this.userInfo?.firstName ?? ''} ${this.userInfo?.lastName ?? ''}`,
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    };
  }

  processPayment() {
    if (!this.selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const paymentMethodMap: Record<string, number> = {
      "Credit Card": 0,
      "Debit Card": 1
    };

    // ✅ Prepare Payload
    const paymentPayload = {
      reservationId: this.reservationId,
      paymentMethod: paymentMethodMap[this.selectedPaymentMethod],
      cardHolderName: this.paymentData.cardHolderName,
      cardNumber: this.paymentData.cardNumber,
      expiryMonth: this.paymentData.expiryMonth,
      expiryYear: this.paymentData.expiryYear,
      cvv: this.paymentData.cvv,
    };

    console.log("🚀 Processing outbound flight payment:", paymentPayload);

    // ✅ Save Card Info Per User
    if (this.storeCard) {
      if (!this.userEmail) {
        console.error("❌ User email is undefined, cannot store card info!");
        return;
      }

      const maskedCardNumber = `**** **** **** ${this.paymentData.cardNumber.slice(-4)}`;
      const storedCard = {
        cardHolderName: this.paymentData.cardHolderName, // Fixed: was cardHolder
        cardNumber: maskedCardNumber,
        expiryMonth: this.paymentData.expiryMonth,
        expiryYear: this.paymentData.expiryYear
      };

      localStorage.setItem(`savedCard_${this.userEmail}`, JSON.stringify(storedCard));
      console.log("✅ Card saved for user:", this.userEmail, storedCard);
    }

    this.paymentService.paymentForTickets(this.reservationId, paymentPayload).subscribe({
      next: (data: any) => {
        if (data.status === 'Failed') {
          alert("Payment failed for outbound flight. Please try again.");
        } else {
          console.log("✅ Outbound flight payment successful:", data);

          // ✅ Handle round-trip payments
          if (this.returnReservationId) {
            const returnPaymentPayload = { ...paymentPayload, reservationId: this.returnReservationId };
            console.log("🚀 Processing return flight payment:", returnPaymentPayload);

            this.paymentService.paymentForTickets(this.returnReservationId, returnPaymentPayload).subscribe({
              next: (returnData: any) => {
                if (returnData.status === 'Failed') {
                  alert("Payment failed for return flight. Please try again.");
                } else {
                  console.log("✅ Return flight payment successful:", returnData);
                  alert(`Payment successful via ${this.selectedPaymentMethod}. Redirecting...`);
                  this.router.navigate(['/payment-success'], {
                    queryParams: { reservationId: this.reservationId, returnReservationId: this.returnReservationId }
                  });
                }
              },
              error: (err) => {
                console.error("❌ Error processing return flight payment:", err);
                alert("Payment failed for return flight. Please try again.");
              }
            });
          } else {
            alert(`Payment successful via ${this.selectedPaymentMethod}. Redirecting...`);
            this.router.navigate(['/payment-success', this.reservationId]);
          }
        }
      },
      error: (err) => {
        if (err.status === 400) {
          alert("Payment already completed. You cannot pay twice.");
        } else {
          alert("Payment failed. Please try again.");
        }
        console.error("❌ Error processing payment:", err);
      }
    });
  }
}