import { Component, inject, type OnInit } from "@angular/core"
import { BookingService } from "../../../services/booking.service"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"

@Component({
  selector: "app-booking-history",
  imports: [CommonModule],
  templateUrl: "./booking-history.component.html",
  styleUrls: ["./booking-history.component.css"],
})
export class BookingHistoryComponent implements OnInit {
  bookingService = inject(BookingService)
  router = inject(Router)

  bookingList: any[] = []
  filteredBookingList: any[] = []
  currentFilter = "all"
  isLoading = true

  ngOnInit() {
    this.checkExpiredReservations()
    this.fetchAllReservations()
  }

  checkExpiredReservations() {
    this.bookingService.checkExpiredReservations().subscribe({
      next: (res: any) => {
        console.log(res)
        console.log(`Expired reservations updated: ${res.updatedCount}`)
      },
      error: (err) => {
        console.error("Error checking expired reservations:", err)
      },
    })
  }

  setFilter(type: string) {
    this.currentFilter = type
    this.filterBookings(type)
  }

  filterBookings(type: string) {
    const now = new Date()

    if (type === "all") {
      this.filteredBookingList = [...this.bookingList]
    } else if (type === "upcoming") {
      this.filteredBookingList = this.bookingList.filter((booking) => new Date(booking.flight.departureDateTime) > now)
    } else if (type === "past") {
      this.filteredBookingList = this.bookingList.filter((booking) => new Date(booking.flight.departureDateTime) < now)
    }

    console.log(`Filtered ${type} journeys:`, this.filteredBookingList)
  }

  fetchAllReservations() {
    this.isLoading = true
    this.bookingService.getUserBookings().subscribe({
      next: (data: any) => {
        console.log("All Reservations:", data)
        this.bookingList = this.formatBookings(data)
        this.filteredBookingList = [...this.bookingList]
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error fetching reservations:", err)
        this.isLoading = false
      },
    })
  }

  formatBookings(data: any[]): any[] {
    return data.map((booking) => ({
      ...booking,
      bookingDate: booking.bookingDate ? new Date(booking.bookingDate) : "N/A",
      flight: {
        ...booking.flight,
        departureDateTime: booking.flight.departureDateTime ? new Date(booking.flight.departureDateTime) : "N/A",
        arrivalDateTime: booking.flight.arrivalDateTime ? new Date(booking.flight.arrivalDateTime) : "N/A",
      },
      passengers: booking.passengers ?? [],
    }))
  }

  moreDetails(id: number) {
    console.log("Show more details logic here")
    this.router.navigate(["/booking-information", id])
  }

  // Enhanced utility methods
  getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: "Pending",
      1: "Confirmed",
      2: "Cancelled",
      3: "Refunded",
    }
    return statusMap[status] || "Unknown"
  }

  getAirportCode(cityName: string): string {
    // Extract airport code from city name or generate one
    const airportCodes: Record<string, string> = {
      "New York": "NYC",
      "Los Angeles": "LAX",
      Chicago: "CHI",
      Miami: "MIA",
      London: "LHR",
      Paris: "CDG",
      Tokyo: "NRT",
      Dubai: "DXB",
      Mumbai: "BOM",
      Delhi: "DEL",
      Bangalore: "BLR",
      Chennai: "MAA",
      Kolkata: "CCU",
      Hyderabad: "HYD",
    }

    return airportCodes[cityName] || cityName.substring(0, 3).toUpperCase()
  }

  calculateDuration(departure: Date, arrival: Date): string {
    if (!departure || !arrival) return "N/A"

    const diff = new Date(arrival).getTime() - new Date(departure).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  getJourneyType(departureDate: Date): string {
    const now = new Date()
    return new Date(departureDate) > now ? "Upcoming" : "Completed"
  }

  getJourneyClass(departureDate: Date): string {
    const now = new Date()
    return new Date(departureDate) > now ? "upcoming" : "past"
  }

  getUpcomingCount(): number {
    const now = new Date()
    return this.bookingList.filter((booking) => new Date(booking.flight.departureDateTime) > now).length
  }

  getPastCount(): number {
    const now = new Date()
    return this.bookingList.filter((booking) => new Date(booking.flight.departureDateTime) < now).length
  }

  getUniqueDestinations(): number {
    const destinations = new Set()
    this.bookingList.forEach((booking) => {
      destinations.add(booking.flight.destination)
      destinations.add(booking.flight.origin)
    })
    return destinations.size
  }

  trackByBookingId(index: number, booking: any): any {
    return booking.id
  }

  navigateToBooking() {
    this.router.navigate(["/booking"])
  }
}
