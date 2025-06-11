import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { TicketComponent } from '../ticket/ticket.component';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration: number;
}

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [TicketComponent, CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  animations: [
    trigger('fadeInDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class PaymentSuccessComponent implements OnInit {
  reservationId = '';
  bookingInfo: any;
  flightInfo: any;
  particles: Particle[] = [];

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {
    // Generate background particles
    this.generateParticles();
  }

  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Extract reservation ID from route
    this.route.params.subscribe((params) => {
      this.reservationId = params['reservationId'] as string;
      console.log('Extracted Reservation ID:', this.reservationId);
      // Fetch booking information
      this.loadBookingInfo();
    });
  }

  /**
   * Load booking information from the service
   */
  private loadBookingInfo(): void {
    // Convert string to number since the service expects a number
    const bookingId = Number(this.reservationId);

    // Check if conversion was successful
    if (isNaN(bookingId)) {
      console.error('Invalid reservation ID:', this.reservationId);
      this.showErrorMessage('Invalid reservation ID');
      return;
    }

    this.bookingService.getBookingInformation(bookingId).subscribe({
      next: (data: any) => {
        console.log('Booking data received:', data);
        this.bookingInfo = data;
        this.flightInfo = data.flight;
        console.log('Booking Info:', this.bookingInfo);
      },
      error: (err) => {
        console.error('Error fetching booking info:', err);
        this.showErrorMessage('Failed to load booking information');
      },
    });
  }

  /**
   * Generate background particles for animation
   */
  private generateParticles(): void {
    this.particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }));
  }

  /**
   * Print the ticket
   */
  printTicket(): void {
    window.print();
  }

  /**
   * Email the ticket to the user
   */
  emailTicket(): void {
    // This would typically connect to a backend service
    // For now, we'll just show a success message
    alert('Ticket has been sent to your email address!');
  }

  /**
   * Download the ticket as PDF
   */
  downloadTicket(): void {
    // This would typically generate a PDF
    // For now, we'll just show a success message
    alert('Ticket PDF download started!');
  }

  /**
   * Get current formatted date
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    // Implement toast notification or modal
    console.error('Error:', message);
    alert(message); // Temporary - replace with proper notification
  }
}
