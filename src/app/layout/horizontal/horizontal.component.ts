import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HorizontaltopbarComponent } from '../horizontaltopbar/horizontaltopbar.component';
import { RouterOutlet } from '@angular/router';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';
import { AuthService } from 'src/app/core/service/auth.service';

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
export class HorizontalComponent {
  constructor(private authService: AuthService) { }
  @HostListener('window:storage', ['$event']) checkLoggedIn(event: Storage) {
    if (event['storageArea'] == localStorage) {
      localStorage.getItem('currentUser') ?? this.authService.logout();
    }
  }
}
