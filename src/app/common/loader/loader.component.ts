import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {
  logosrc: string;

  constructor(private authService: AuthService) {
    this.logosrc = 'assets/images/upjl/icon.png';
  }
  ngOnInit(): void {
    this.logosrc = 'assets/images/upjl/icon.png';
  }
  @HostListener('window:storage', ['$event']) checkLoggedIn(event: Storage) {
    if (event['storageArea'] == localStorage) {
      localStorage.getItem('currentUser') ?? this.authService.logout();
    }
  }
}
