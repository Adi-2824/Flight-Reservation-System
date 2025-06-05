import { Component } from '@angular/core';
import { HeaderComponent } from '../dashHeader/header.component';
import { FooterComponent } from '../dashFooter/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dash-main',
  imports: [HeaderComponent,FooterComponent,RouterOutlet],
  templateUrl: './dash-main.component.html',
  styleUrl: './dash-main.component.css'
})
export class DashMainComponent {

}
