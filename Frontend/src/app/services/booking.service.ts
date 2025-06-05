import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient,HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  //https://localhost:7035/api/Reservations/CreateReservation?userId=4
  private API_URL = 'https://localhost:7035/api/Reservations';
  constructor(private http: HttpClient) { }

  getBookingInformation(flightId:number){
     const token = localStorage.getItem("token");
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.API_URL}/GetReservation/${flightId}`,{headers});
  }


  bookTickets(flightNumber:number,data:any[]){
    const token = localStorage.getItem("token");
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log(headers);
    const payload = {
      flightId:flightNumber,
      passengers: data.map(traveller=>({
        seatClass : traveller.seatClass,
         firstName :traveller.firstName,
         lastName: traveller.lastName,
         gender:traveller.gender,
         age:traveller.age
      }))
    };
    console.log(payload);
    return this.http.post(`${this.API_URL}/CreateReservation`,payload,{headers});
  }


    getUserBookings(){
    const token = localStorage.getItem("token");
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.API_URL}/GetUserReservations`,{headers})
  }

    getUpcomingJourneys(): Observable<any[]> {
       const token = localStorage.getItem("token");
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<any[]>(`${this.API_URL}/GetUpcomingJourneys/upcoming`, { headers});
  }

  getPastJourneys(): Observable<any[]> {
     const token = localStorage.getItem("token");
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<any[]>(`${this.API_URL}/GetPastJourneys/past?limit=10`, { headers});
  }

 checkExpiredReservations(): Observable<any> {
  const token = localStorage.getItem("token");
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.put(`${this.API_URL}/CleanupExpiredReservations/CleanupExpired`,{ headers });
}

cancelReservation(reservationId: number): Observable<any> {
  const token = localStorage.getItem("token");
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  console.log(reservationId);
  return this.http.delete(`${this.API_URL}/CancelReservation/${reservationId}`,{ headers });
}

updatePassenger(reservationId:any,passenger: any): Observable<any> {
  const token = localStorage.getItem("token");
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
console.log(passenger);
const payload = {
    id: passenger.id,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    age: passenger.age,
    gender: passenger.gender,
    seatClass: passenger.seatClass,
    reservationId: reservationId
  };


  return this.http.put(`${this.API_URL}/UpdatePassenger/update-passenger/${reservationId}`, payload);
}


}
