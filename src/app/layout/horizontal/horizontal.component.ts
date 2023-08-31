import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HorizontaltopbarComponent } from '../horizontaltopbar/horizontaltopbar.component';
import { RouterOutlet } from '@angular/router';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';

@Component({
  selector: 'app-horizontal',
  standalone: true,
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
  imports: [
    CommonModule,
    FooterComponent,
    HorizontaltopbarComponent,
    RouterOutlet,
    RightsidebarComponent,
  ],
})
export class HorizontalComponent {}
