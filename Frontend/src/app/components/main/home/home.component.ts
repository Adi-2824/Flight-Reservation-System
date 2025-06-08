import { Component, inject, type OnInit, type OnDestroy } from "@angular/core"
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { CommonModule, DatePipe } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { FlightsService } from "../../../services/flights.service"
import Swal from "sweetalert2"
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from "rxjs"

interface Particle {
  x: number
  delay: number
}

interface Feature {
  number: string
  title: string
  description: string
  icon: string
}

interface Service {
  icon: string
  title: string
  description: string
}

@Component({
  selector: "app-home",
  standalone: true,
  providers: [DatePipe],
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()

  // Form and data properties
  searchForm: FormGroup = new FormGroup({
    departureCity: new FormControl('', [Validators.required]),
    arrivalCity: new FormControl('', [Validators.required]),
    departureTime: new FormControl('', [Validators.required])
  })
  flights: any[] = []
  allOrigins: string[] = []
  filteredOrigins: string[] = []
  allDestinations: string[] = []
  filteredDestinations: string[] = []

  // UI state properties
  selectedClass = "economy"
  focusedField: string | null = null
  isSearching = false
  passengerCount = 1
  minDate = ""
  newsletterEmail = ""

  // Animation and visual properties
  particles: Particle[] = []

  // Static data
  features: Feature[] = [
    {
      number: "01",
      title: "Travel Requirements for Dubai",
      description:
        "Stay informed and prepared for your trip to Dubai with essential travel requirements, ensuring a smooth and hassle-free experience in this vibrant and captivating city.",
      icon: "fas fa-passport",
    },
    {
      number: "02",
      title: "Multi-risk travel insurance",
      description:
        "Comprehensive protection for your peace of mind, covering a range of potential travel risks and unexpected situations.",
      icon: "fas fa-shield-alt",
    },
    {
      number: "03",
      title: "Travel Requirements by destinations",
      description:
        "Stay informed and plan your trip with ease, as we provide up-to-date information on travel requirements specific to your desired destinations.",
      icon: "fas fa-globe-americas",
    },
  ]

  services: Service[] = [
    {
      icon: "ri-calendar-2-line",
      title: "Book & relax",
      description:
        'With "Book and Relax," you can sit back, unwind, and enjoy the journey while we take care of everything else.',
    },
    {
      icon: "ri-shield-check-line",
      title: "Smart Checklist",
      description:
        "Introducing Smart Checklist with us, the innovative solution revolutionizing the way you travel with our airline.",
    },
    {
      icon: "ri-bookmark-2-line",
      title: "Save More",
      description:
        "From discounted ticket prices to exclusive promotions and deals, we prioritize affordability without compromising on quality.",
    },
  ]

  flightService = inject(FlightsService)

  constructor(
    private router: Router,
    private datePipe: DatePipe,
  ) {
    this.setMinDate()
    this.generateParticles()
  }

  ngOnInit() {
    this.loadFlightData()
    this.setupFormListeners()
    this.startAnimations()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private setMinDate() {
    const today = new Date()
    this.minDate = today.toISOString().split("T")[0]
  }

  private generateParticles() {
    this.particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 8,
    }))
  }

  private loadFlightData() {
    this.flightService
      .getFlights()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (flights: any[]) => {
          this.allOrigins = [...new Set(flights.map((flight) => flight.origin))]
          this.allDestinations = [...new Set(flights.map((flight) => flight.destination))]
          console.log("All Origins:", this.allOrigins)
        },
        error: (error) => {
          console.error("Error loading flight data:", error)
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load flight data. Please try again later.",
          })
        },
      })
  }

  private setupFormListeners() {
    // Departure city autocomplete
    this.searchForm
      .get("departureCity")
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value && value.length > 0) {
          this.filteredOrigins = this.allOrigins
            .filter((origin) => origin.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5) // Limit to 5 results
        } else {
          this.filteredOrigins = []
        }
      })

    // Arrival city autocomplete
    this.searchForm
      .get("arrivalCity")
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value && value.length > 0) {
          this.filteredDestinations = this.allDestinations
            .filter((destination) => destination.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5) // Limit to 5 results
        } else {
          this.filteredDestinations = []
        }
      })
  }

  private startAnimations() {
    // Add any additional animation initialization here
    console.log("Animations started")
  }

  // UI Event Handlers
  selectClass(className: string) {
    this.selectedClass = className
    // Add haptic feedback or sound effect here if needed
  }

  onFieldFocus(field: string) {
    this.focusedField = field
  }

  onFieldBlur(field: string) {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      if (this.focusedField === field) {
        this.focusedField = null
      }
    }, 200)
  }

  selectOrigin(origin: string) {
    this.searchForm.get("departureCity")?.setValue(origin)
    this.filteredOrigins = []
    this.focusedField = null

    // Add smooth animation feedback
    this.showSelectionFeedback("Departure city selected")
  }

  selectDestination(destination: string) {
    this.searchForm.get("arrivalCity")?.setValue(destination)
    this.filteredDestinations = []
    this.focusedField = null

    // Add smooth animation feedback
    this.showSelectionFeedback("Destination selected")
  }

  swapCities() {
    const departureValue = this.searchForm.get("departureCity")?.value
    const arrivalValue = this.searchForm.get("arrivalCity")?.value

    this.searchForm.get("departureCity")?.setValue(arrivalValue)
    this.searchForm.get("arrivalCity")?.setValue(departureValue)

    // Add visual feedback for swap action
    this.showSelectionFeedback("Cities swapped")
  }

  increasePassengers() {
    if (this.passengerCount < 9) {
      this.passengerCount++
    }
  }

  decreasePassengers() {
    if (this.passengerCount > 1) {
      this.passengerCount--
    }
  }

  private showSelectionFeedback(message: string) {
    // You can implement a toast notification or subtle animation here
    console.log(message)
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched()
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill in all required fields",
        confirmButtonColor: "#667eea",
      })
      return
    }

    this.isSearching = true
    const formData = this.searchForm.value
    formData.departureTime = this.datePipe.transform(formData.departureTime, "yyyy-MM-dd") || ""
    formData.seatClass = this.selectedClass
    formData.passengers = this.passengerCount

    // Simulate search delay for better UX
    setTimeout(() => {
      this.router.navigate(["/search"], {
        queryParams: {
          origin: formData.departureCity,
          destination: formData.arrivalCity,
          DepartureDate: formData.departureTime,
          seatClass: formData.seatClass,
          passengers: formData.passengers,
        },
      })
      this.isSearching = false
    }, 1500)
  }

  private markFormGroupTouched() {
    Object.keys(this.searchForm.controls).forEach((key) => {
      const control = this.searchForm.get(key)
      control?.markAsTouched()
    })
  }

  bookFlight(flight: any) {
    Swal.fire({
      icon: "success",
      title: "Flight Selected!",
      text: `You selected flight ${flight.airline.airlineCode}-${flight.flightNumber}`,
      confirmButtonColor: "#667eea",
      confirmButtonText: "Proceed to Booking",
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to booking page with flight details
        this.router.navigate(["/booking"], {
          queryParams: {
            flightId: flight.id,
            passengers: this.passengerCount,
            seatClass: this.selectedClass,
          },
        })
      }
    })
  }

  subscribeNewsletter() {
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: "#667eea",
      })
      return
    }

    // Simulate newsletter subscription
    Swal.fire({
      icon: "success",
      title: "Subscribed!",
      text: "Thank you for subscribing to our newsletter",
      confirmButtonColor: "#667eea",
    })

    this.newsletterEmail = ""
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Utility methods for template
  trackByIndex(index: number, item: any): number {
    return index
  }

  // Animation trigger methods
  onMouseEnter(element: any) {
    // Add hover animations
  }

  onMouseLeave(element: any) {
    // Remove hover animations
  }
}










// import { Component, inject, OnInit, OnDestroy } from '@angular/core';
// import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule, DatePipe } from '@angular/common';
// import { FlightsService } from '../../../services/flights.service';
// import Swal from 'sweetalert2';
// import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// @Component({
//   selector: 'app-home',
//   providers: [DatePipe],
//   imports: [CommonModule, ReactiveFormsModule, FormsModule], // ✅ Add `CommonModule`
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css',
// })
// export class HomeComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();

//   searchForm: FormGroup = new FormGroup({
//     seatClass: new FormControl('One Way Trip'),
//     departureCity: new FormControl('', Validators.required),
//     arrivalCity: new FormControl('', Validators.required),
//     departureTime: new FormControl('', Validators.required),
//     returnTime: new FormControl({ value: '', disabled: true }),
//   });

//   flights: any[] = [];
//   filteredOrigins: string[] = [];
//   filteredDestinations: string[] = [];
//   allOrigins: string[] = [];
//   allDestinations: string[] = [];
//   newsletterEmail: string = '';
//   isRoundTrip = false;
//   minDate = '';

//   flightService = inject(FlightsService);

//   constructor(private router: Router, private datePipe: DatePipe) {
//     this.setMinDate();
//   }

//   ngOnInit() {
//     this.loadFlightData();
//     this.setupFormListeners();
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   private setMinDate() {
//     const today = new Date();
//     this.minDate = today.toISOString().split('T')[0];
//   }

//   private loadFlightData() {
//     this.flightService.getFlights().pipe(takeUntil(this.destroy$)).subscribe({
//       next: (flights: any[]) => {
//         this.allOrigins = [...new Set(flights.map((flight) => flight.origin))];
//         this.allDestinations = [...new Set(flights.map((flight) => flight.destination))];
//       },
//       error: () => {
//         Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load flight data.' });
//       },
//     });
//   }

//   private setupFormListeners() {
//     this.searchForm.get('departureCity')?.valueChanges.pipe(
//       debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)
//     ).subscribe((value) => {
//       this.filteredOrigins = this.allOrigins.filter((origin) => origin.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
//     });

//     this.searchForm.get('arrivalCity')?.valueChanges.pipe(
//       debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)
//     ).subscribe((value) => {
//       this.filteredDestinations = this.allDestinations.filter((destination) => destination.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
//     });

//     this.searchForm.get('seatClass')?.valueChanges.subscribe((value) => {
//       this.isRoundTrip = value === 'Round Way Trip';
//       if (this.isRoundTrip) {
//         this.searchForm.get('returnTime')?.enable();
//       } else {
//         this.searchForm.get('returnTime')?.disable();
//         this.searchForm.patchValue({ returnTime: '' });
//       }
//     });
//   }

//   selectOrigin(origin: string) {
//     this.searchForm.get('departureCity')?.setValue(origin);
//     this.filteredOrigins = [];
//   }

//   selectDestination(destination: string) {
//     this.searchForm.get('arrivalCity')?.setValue(destination);
//     this.filteredDestinations = [];
//   }

//   swapCities() {
//     const temp = this.searchForm.value.departureCity;
//     this.searchForm.patchValue({
//       departureCity: this.searchForm.value.arrivalCity,
//       arrivalCity: temp,
//     });
//   }

//   onSubmit() {
//     if (this.searchForm.invalid) {
//       Swal.fire('Please fill in all required fields.');
//       return;
//     }

//     const formData = this.searchForm.value;
//     const today = new Date().toISOString().split('T')[0];
//     const selectedDate = this.datePipe.transform(formData.departureTime, 'yyyy-MM-dd') || '';

//     if (selectedDate < today) {
//       Swal.fire('You cannot select a departure date before today.');
//       return;
//     }

//     formData.returnTime = this.datePipe.transform(formData.returnTime, 'yyyy-MM-dd');

//     this.router.navigate(['/search'], {
//       queryParams: {
//         origin: formData.departureCity,
//         destination: formData.arrivalCity,
//         DepartureDate: selectedDate,
//         ReturnDate: this.isRoundTrip ? formData.returnTime : null,
//         isRoundTrip: this.isRoundTrip,
//       },
//     });
//   }
// }