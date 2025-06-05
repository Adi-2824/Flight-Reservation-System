import { CommonModule } from '@angular/common';
import { Component, OnInit , inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';


@Component({
  selector: 'app-payment',
  imports:[CommonModule,FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit{
  totalAmount: any; // Example amount
  selectedPaymentMethod: string = '';
  bookingService = inject(BookingService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  bookingInfo:any;
  reservationId:any;
  userInfo :any;
  paymentData:any;
  storeCard:any;
  paymentService = inject(PaymentService);
  constructor(private router: Router) {}
  ngOnInit(): void {

     this.route.params.subscribe(params => {
    this.reservationId = params['id']; // ✅ Extracting ID from route
    console.log("Extracted Reservation ID:", this.reservationId); // Debugging check
     });

     this.userInfo = this.authService.getUserData();
     this.userInfo = this.userInfo.user;
     console.log(this.userInfo);

     // ✅ Pre-fill card details if available in user info
  this.paymentData = {
    cardHolderName: this.userInfo?.firstName+' '+ this.userInfo?.lastName || '',
    cardNumber: this.userInfo?.cardNumber || '',
    expiryMonth: this.userInfo?.expiryMonth || '',
    expiryYear : this.userInfo?.expiryYear ||'',
    cvv: this.userInfo?.cvv || '',
  };

    // Retrieve stored card from localStorage
  const savedCard = JSON.parse(localStorage.getItem("savedCard") || "{}");
  if (savedCard.cardNumber) {
    console.log("Found saved card:", savedCard);
    this.paymentData.cardHolderName = savedCard.cardHolder;
    this.paymentData.cardNumber = savedCard.cardNumber; // Show masked card number
    this.paymentData.expiryMonth = savedCard.expiryMonth;
    this.paymentData.expiryYear = savedCard.expiryYear;
  }

 
    this.bookingService.getBookingInformation(this.reservationId)
    .subscribe({
      next: (data: any) => {
      this.bookingInfo = data;
      this.totalAmount = data.totalAmount; // ✅ Extract totalAmount
      console.log("Booking Info:", this.bookingInfo); // Debugging check
    },
    error: (err) => {
      console.error("Error fetching booking info:", err);
    }
    });


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

   const paymentPayload = {
    reservationId: this.reservationId,
    paymentMethod: paymentMethodMap[this.selectedPaymentMethod], // ✅ Convert method for backend
    cardHolderName: this.paymentData.cardHolderName,
    cardNumber: this.paymentData.cardNumber,
    expiryMonth: this.paymentData.expiryMonth,
    expiryYear :this.paymentData.expiryYear,
    cvv: this.paymentData.cvv,
  };
console.log("Final Payload:", paymentPayload); // Debugging check
 // Save card info in localStorage if user agrees
  if (this.storeCard) { 
    const maskedCardNumber = `**** **** **** ${this.paymentData.cardNumber.slice(-4)}`; // Mask card number
    const storedCard = {
      cardHolder: this.paymentData.cardHolderName,
      cardNumber: maskedCardNumber, // Save only last 4 digits
      expiryMonth: this.paymentData.expiryMonth,
      expiryYear: this.paymentData.expiryYear
    };
    localStorage.setItem("savedCard", JSON.stringify(storedCard));
    console.log("Card saved in localStorage:", storedCard);
  }

this.paymentService.paymentForTickets(this.reservationId, paymentPayload).subscribe({
    next: (data:any) => {
      if(data.status ==='Failed'){
         alert("Payment failed. Please try again.");
      }
      else{
      alert(`Payment successful via ${this.selectedPaymentMethod}. Redirecting...`);
      console.log(data);
      console.log("Navigating to:", `/payment-success/${this.reservationId}`);
      this.router.navigate(['/payment-success',this.reservationId]);
      }
    },
    error: (err) => {
       if (err.status === 400) {
        alert("Payment already completed. You cannot pay twice.");
      } else {
        alert("Payment failed. Please try again.");
      }
      console.error("Error processing payment:", err);

    }
  });


    // alert(`Payment successful via ${this.selectedPaymentMethod}. Redirecting...`);
    // this.router.navigate(['/payment-success']);
  }
}
