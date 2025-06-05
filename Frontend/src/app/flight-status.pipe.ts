import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flightStatus',
  standalone:true
})
export class FlightStatusPipe implements PipeTransform {

  transform(value: number): string {   
    const statusMap: Record<number,string> = {
      0: 'Scheduled',
      1: 'Delayed',
      2: 'Cancelled',
      3: 'Completed'
    };
    return statusMap[value] ?? 'Unknown';

  }
  }

