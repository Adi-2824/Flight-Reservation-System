import { Component, type OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { TicketComponent } from '../ticket/ticket.component';
import { CommonModule } from '@angular/common';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger,
  keyframes,
} from '@angular/animations';

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

interface Confetti {
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
}

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [TicketComponent, CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        query(
          '.success-icon',
          [
            style({ transform: 'scale(0)', opacity: 0 }),
            animate(
              '800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              style({ transform: 'scale(1)', opacity: 1 })
            ),
          ],
          { optional: true }
        ),
        query(
          '.success-content',
          [
            style({ opacity: 0, transform: 'translateY(30px)' }),
            animate(
              '600ms 200ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            ),
          ],
          { optional: true }
        ),
        query(
          '.action-item',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '500ms 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
        query(
          '.step-card',
          [
            style({ opacity: 0, transform: 'translateY(40px) scale(0.9)' }),
            stagger(150, [
              animate(
                '600ms 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                style({ opacity: 1, transform: 'translateY(0) scale(1)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),

    trigger('checkmark', [
      transition(':enter', [
        style({ strokeDasharray: '0 100' }),
        animate('1000ms 300ms ease-out', style({ strokeDasharray: '100 100' })),
      ]),
    ]),

    trigger('buttonHover', [
      transition(':enter', [style({ transform: 'scale(1)' })]),
      transition('* => hover', [
        animate(
          '200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({ transform: 'scale(1.05) translateY(-2px)' })
        ),
      ]),
      transition('hover => *', [
        animate(
          '200ms ease-out',
          style({ transform: 'scale(1) translateY(0)' })
        ),
      ]),
    ]),

    trigger('pulseGlow', [
      transition(':enter', [
        animate(
          '2000ms ease-in-out',
          keyframes([
            style({ boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)', offset: 0 }),
            style({ boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  reservationId = '';
  bookingInfo: any;
  flightInfo: any;
  particles: Particle[] = [];
  confetti: Confetti[] = [];
  isLoading = true;
  showConfetti = true;

  private confettiInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {
    this.generateParticles();
    this.generateConfetti();
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.route.params.subscribe((params) => {
      this.reservationId = params['id'] as string;
      this.loadBookingInfo();
    });

    // Auto-hide confetti after 5 seconds
    setTimeout(() => {
      this.showConfetti = false;
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
  }

  private loadBookingInfo(): void {
    const bookingId = Number(this.reservationId);

    if (isNaN(bookingId)) {
      this.showErrorMessage('Invalid reservation ID');
      return;
    }

    // Simulate loading delay for better UX
    setTimeout(() => {
      this.bookingService.getBookingInformation(bookingId).subscribe({
        next: (data: any) => {
          this.bookingInfo = data;
          this.flightInfo = data.flight;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching booking info:', err);
          this.isLoading = false;
          this.showErrorMessage('Failed to load booking information');
        },
      });
    }, 1500);
  }

  private generateParticles(): void {
    this.particles = Array.from({ length: 15 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      size: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }

  private generateConfetti(): void {
    const colors = [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#3b82f6',
      '#8b5cf6',
    ];
    this.confetti = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.5 + Math.random() * 0.5,
    }));
  }

  printTicket(): void {
    this.showSuccessMessage('Preparing ticket for printing...');
    setTimeout(() => window.print(), 500);
  }

  emailTicket(): void {
    this.showSuccessMessage('Ticket sent to your email address!');
  }

  downloadTicket(): void {
    this.showSuccessMessage('Downloading your ticket...');
    // Simulate download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `ticket-${this.reservationId}.pdf`;
      link.click();
    }, 1000);
  }

  onCheckIn(): void {
    this.showSuccessMessage('Redirecting to check-in...');
  }

  onManageBooking(): void {
    this.router.navigate(['/manage-booking', this.reservationId]);
  }

  onTrackFlight(): void {
    this.router.navigate(['/flight-status']);
  }

  onContactSupport(): void {
    window.open('/support', '_blank');
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private showSuccessMessage(message: string): void {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    console.error('Error:', message);
    alert(message);
  }

  onButtonHover(event: Event, isHover: boolean): void {
    const target = event.target as HTMLElement;
    if (isHover) {
      target.setAttribute('data-state', 'hover');
    } else {
      target.setAttribute('data-state', '');
    }
  }

  onButtonLeave(event: Event, isHover: boolean): void {
    const target = event.target as HTMLElement;
    if (isHover) {
      target.setAttribute('data-state', 'hover');
    } else {
      target.setAttribute('data-state', '');
    }
  }
}
