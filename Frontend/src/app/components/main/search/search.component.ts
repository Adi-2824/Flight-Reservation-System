



import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightsService } from '../../../services/flights.service';
import { FlightStatusPipe } from '../../../flight-status.pipe';

@Component({
  selector: 'app-search',
  imports: [CommonModule,FlightStatusPipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  flights: any[] = [];
  selectedClass :'Economy'|'Business' ='Economy';

  flightService = inject(FlightsService);
  route = inject(ActivatedRoute);
  router = inject(Router);




  ngOnInit(): void {
    // ✅ Extract query parameters from URL
    this.route.queryParams.subscribe(params => {
      const from = params['origin']?.toString();
      const to = params['destination']?.toString();
      const date = params['DepartureDate']?.toString();

      console.log("Extracted Params:", { from, to, date });

      if (from && to && date) {
        // ✅ Call flight search API
        //Scheduled,
// Delayed,
// Cancelled,
// Completed
        this.flightService.searchFlight(from, to, date).subscribe({
          next: (result: any) => {
            this.flights = result;
            console.log("Flights Found:", this.flights);
          },
          error: (err: any) => {
            console.error("Error fetching flights:", err);
          }
        });
      }
    });
  }

  // ✅ Navigate to flight booking page with flight ID
  BookFlight(flightId: number) {
    console.log("Booking flight with ID:", flightId);
    this.router.navigate(['home/booking', flightId]);
  }
  
   // ✅ Function to Toggle Price Display
  toggleClass(selected: 'Economy' | 'Business') {
    this.selectedClass = selected;
  }

}
