
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-ticket',
  imports:[CommonModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent {
  @Input() bookingInfo: any; // ✅ Receive booking details from parent component
  @Input() flightInfo:any;


  getSeatClassLabel(value: number): string {
  const seatClassMap: Record<number, string> = {
    0: 'Economy',
    1: 'Business'
  };
  return seatClassMap[value] || 'Unknown'; // Handle unexpected values
}
generatePDF() {
    const ticketElement = document.getElementById('ticketContainer');
    if (!ticketElement) {
      console.error("Ticket container not found!");
      return;
    }
     html2canvas(ticketElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('flight_ticket.pdf'); // ✅ Saves as PDF
    });
  }


  printTicket() {
    window.print(); // ✅ Opens print dialog
  }
}