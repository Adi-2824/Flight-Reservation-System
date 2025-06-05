// // import { Component } from '@angular/core';
// // import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// // import {  Router } from '@angular/router';
// // import { CommonModule, DatePipe } from '@angular/common';
// // import { FlightsService } from '../../../services/flights.service';
// // import Swal from 'sweetalert2';


// // @Component({
// //   selector: 'app-home',
// //   providers:[DatePipe],
// //   imports: [ReactiveFormsModule,CommonModule],
// //   templateUrl: './home.component.html',
// //   styleUrl: './home.component.css'
// // })
// // export class HomeComponent {
// //     searchForm:FormGroup;
// //     flights:any[]=[];

// //     constructor(private router:Router, private datePipe:DatePipe, private flightService:FlightsService ){
// //       this.searchForm = new FormGroup({
// //         departureAirport: new FormControl(''),
// //         arrivalAirport: new FormControl(''),
// //         departureDate: new FormControl('')
  
// //       })
// //     };

// //     onSubmit(){
// //       if (this.searchForm.invalid) {
// //         Swal.fire('Please fill in all required fields');
// //         return;
// //       }
  
// //       // Extract Form Values
// //       const formData = this.searchForm.value;
// //       formData.departureDate = this.datePipe.transform(formData.departureDate, 'yyyy-MM-dd');
  
// //       // Call Flight Search API
// //       this.flightService.searchFlight(formData.departureAirport, formData.arrivalAirport, formData.departureDate)
// //         .subscribe({
// //           next:(result:any)=>{
// //             console.log("API Response in HomeComponent:", result);
// //             this.flights = result.length ? result : [];
// //             Swal.fire('Flights fetched successfully!');
// //             this.router.navigate(['/search'],{ state: { flights: result } });
// //           },
// //           error:(err:any)=>{
// //             console.error('Error fetching flights:', err);
// //           Swal.fire('Failed to fetch flights. Try again later.');
// //           }
// //         });
    
  
// //     }
// // }

// import { Component,inject } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule, DatePipe } from '@angular/common';
// import { FlightsService } from '../../../services/flights.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-home',
//   providers: [DatePipe],
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css'
// })
// export class HomeComponent {
//   searchForm: FormGroup;
//   flights: any[] = [];
//    allOrigins: string[] = []; // ✅ Stores all unique origins
//   filteredOrigins: string[] = []; // ✅ Stores filtered origins
//   allDestinations: string[] = []; // ✅ Stores all unique destinations
//   filteredDestinations: string[] = []; // ✅ Stores filtered destinations
//   flightService = inject(FlightsService);


//   constructor(private router: Router, private datePipe: DatePipe,) {
//     this.searchForm = new FormGroup({
//       departureCity: new FormControl('', { nonNullable: true }),
//       arrivalCity: new FormControl('', { nonNullable: true }),
//       departureTime: new FormControl('', { nonNullable: true })
//     });
//   }

//   onSubmit() {
//     if (this.searchForm.invalid) {
//       Swal.fire('Please fill in all required fields');
//       return;
//     }

//     // Extract Form Values
//     const formData = this.searchForm.value;

//     // ✅ Format the Date Properly to Match API Expectations
//     formData.departureTime = this.datePipe.transform(formData.departureTime, 'yyyy-MM-dd') || '';

//     console.log("Formatted Date String:", formData.departureTime);
//           this.router.navigate(['/search'],{queryParams: {
//       origin: formData.departureCity,
//       destination: formData.arrivalCity,
//       DepartureDate: formData.departureTime}}
//  );
//   }
// }
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FlightsService } from '../../../services/flights.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  providers: [DatePipe],
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  flights: any[] = [];
  allOrigins: string[] = []; // ✅ Stores all unique origins
  filteredOrigins: string[] = []; // ✅ Stores filtered origins
  allDestinations: string[] = []; // ✅ Stores all unique destinations
  filteredDestinations: string[] = []; // ✅ Stores filtered destinations
  flightService = inject(FlightsService);

  constructor(private router: Router, private datePipe: DatePipe) {
    this.searchForm = new FormGroup({
      departureCity: new FormControl('', { nonNullable: true }),
      arrivalCity: new FormControl('', { nonNullable: true }),
      departureTime: new FormControl('', { nonNullable: true })
    });
  }

  ngOnInit() {
    // ✅ Fetch flight data and extract unique origins & destinations
    this.flightService.getFlights().subscribe((flights: any[]) => {
      this.allOrigins = [...new Set(flights.map(flight => flight.origin))]; // ✅ Extract unique origins
      this.allDestinations = [...new Set(flights.map(flight => flight.destination))]; // ✅ Extract unique destinations
       console.log("All Origins:", this.allOrigins); 
    });

    // ✅ Listen for changes in the departureCity input
    this.searchForm.get('departureCity')?.valueChanges.subscribe(value => {
      this.filteredOrigins = this.allOrigins.filter(origin =>
        origin.toLowerCase().startsWith(value.toLowerCase())
      );
      console.log("Filtered Origins:", this.filteredOrigins);
    });

    // ✅ Listen for changes in the arrivalCity input
    this.searchForm.get('arrivalCity')?.valueChanges.subscribe(value => {
      this.filteredDestinations = this.allDestinations.filter(destination =>
        destination.toLowerCase().startsWith(value.toLowerCase())
      );
    });
  }

  // ✅ Function to select an origin
  selectOrigin(origin: string) {
    this.searchForm.get('departureCity')?.setValue(origin);
    this.filteredOrigins = []; // Hide dropdown after selection
  }

  // ✅ Function to select a destination
  selectDestination(destination: string) {
    this.searchForm.get('arrivalCity')?.setValue(destination);
    this.filteredDestinations = []; // Hide dropdown after selection
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      Swal.fire('Please fill in all required fields');
      return;
    }

    const formData = this.searchForm.value;
    formData.departureTime = this.datePipe.transform(formData.departureTime, 'yyyy-MM-dd') || '';

    this.router.navigate(['/search'], {
      queryParams: {
        origin: formData.departureCity,
        destination: formData.arrivalCity,
        DepartureDate: formData.departureTime
      }
    });
  }
}


