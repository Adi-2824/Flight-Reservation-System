// import { Component } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { FlightsService } from '../../services/flights.service';
// import { Validators } from '@angular/forms';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-add-flight',
//   imports: [ReactiveFormsModule],
//   templateUrl: './add-flight.component.html',
//   styleUrl: './add-flight.component.css'
// })
// export class AddFlightComponent {

//   addFlightForm : FormGroup;

//   constructor(private flightService: FlightsService) {
//     this.addFlightForm = new FormGroup({
//       flightNumber: new FormControl('', Validators.required),
//       airlineId: new FormControl('', Validators.required),
//       departureAirportId: new FormControl('', Validators.required),
//       arrivalAirportId: new FormControl('', Validators.required),
//       departureDate: new FormControl('', Validators.required),
//       departureTime: new FormControl('', Validators.required),
//       arrivalTime: new FormControl('', Validators.required),
//       duration: new FormControl('', Validators.required),
//       status: new FormControl('', Validators.required)
//     });
//   }

//   onSubmit():void{
//     const formData = this.addFlightForm.value;

//     if (this.addFlightForm.invalid) {
//       Swal.fire('Please fill in all required fields');
//       return;
//     }
//     this.flightService.addFlights(this.addFlightForm.value).subscribe({
//       next:(data:any)=>{
//         console.log('Flight added:', data);
//         Swal.fire('Flight added successfully!');
//         this.addFlightForm.reset();
//       },
//       error:(err)=>{
//         console.log(err);
//       }
//     })
// }
// }

// import { Component } from '@angular/core';
// import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
// import { FlightsService } from '../../../services/flights.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-add-flight',
//   imports: [ReactiveFormsModule],
//   templateUrl: './add-flight.component.html',
//   styleUrl: './add-flight.component.css'
// })
// export class AddFlightComponent {

//   addFlightForm: FormGroup;

//   constructor(private flightService: FlightsService) {
//     this.addFlightForm = new FormGroup({
//       flightNumber: new FormControl('', Validators.required),
//       airlineId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
//       departureAirportId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
//       arrivalAirportId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
//       departureDate: new FormControl('', Validators.required),
//       departureTime: new FormControl('', [Validators.required, this.timeValidator()]),
//       arrivalTime: new FormControl('', [Validators.required, this.timeValidator()]),
//       duration: new FormControl('', [Validators.required, this.durationValidator()]),
//       status: new FormControl('', Validators.required)
//     });
//   }

//   timeValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//       if (!control.value) return { invalidTime: true };
//       const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/; // Enforces HH:mm:ss format
//       return timeRegex.test(control.value) ? null : { invalidTime: true };
//     };
//   }

//   durationValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//       if (!control.value) return { invalidDuration: true };
//       const durationRegex = /^([0-9]{1,2}):([0-5]\d):([0-5]\d)$/; // Ensures HH:mm:ss
//       return durationRegex.test(control.value) ? null : { invalidDuration: true };
//     };
//   }

//   onSubmit(): void {
//     if (this.addFlightForm.invalid) {
//       Swal.fire('Please fill in all required fields correctly.');
//       console.log('Validation Errors:', this.addFlightForm.errors);
//       return;
//     }

//     const formData = this.addFlightForm.value;

//     console.log('Submitted Form Data:', formData);

//     this.flightService.addFlights(formData).subscribe({
//       next: (data: any) => {
//         console.log('Flight added:', data);
//         Swal.fire('Flight added successfully!');
//         this.addFlightForm.reset();
//       },
//       error: (err) => {
//         console.log(err);
//         Swal.fire('Error adding flight. Please try again.');
//       }
//     });
//   }
// }


import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightsService } from '../../../services/flights.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-flight',
  imports: [ReactiveFormsModule],
  templateUrl: './add-flight.component.html',
  styleUrl: './add-flight.component.css'
})
export class AddFlightComponent {

  addFlightForm: FormGroup;

  constructor(private flightService: FlightsService) {
    this.addFlightForm = new FormGroup({
      flightNumber: new FormControl('', Validators.required),
      airlineName: new FormControl('', Validators.required),
      departureCity: new FormControl('', Validators.required),
      arrivalCity: new FormControl('', Validators.required),
      departureTime: new FormControl('', Validators.required),
      arrivalTime: new FormControl('', Validators.required),
      totalBusinessSeats: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
      totalEconomySeats: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
      businessClassPrice: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
      economyClassPrice: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')])
    });
  }

  onSubmit(): void {
    if (this.addFlightForm.invalid) {
      Swal.fire('Please fill in all required fields correctly.');
      console.log('Validation Errors:', this.addFlightForm.errors);
      return;
    }

    const formData = this.addFlightForm.value;
    console.log('Submitted Flight Data:', formData);

    this.flightService.addFlights(formData).subscribe({
      next: (data: any) => {
        console.log('Flight added:', data);
        Swal.fire('Flight added successfully!');
        this.addFlightForm.reset();
      },
      error: (err) => {
        console.log(err);
        Swal.fire('Error adding flight. Please try again.');
      }
    });
  }
}