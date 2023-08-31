import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/core/service/event.service';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  isVisible!: string;
  transactions!: Array<[]>;
  statData!: Array<[]>;
  isActive!: string;

  @ViewChild('content') content: any;
  constructor(
    private modalService: NgbModal,
    private eventService: EventService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const attribute = document.body.getAttribute('data-layout')!;

    this.isVisible = attribute;
    const vertical = document.getElementById('layout-vertical');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (attribute == 'horizontal') {
      const horizontal = document.getElementById('layout-horizontal');
      if (horizontal != null) {
        horizontal.setAttribute('checked', 'true');
      }
    }
  }

  @HostListener('window:storage', ['$event']) checkLoggedIn(event: Storage) {
    if (event['storageArea'] == localStorage) {
      localStorage.getItem('currentUser') ?? this.authService.logout();
    }
  }

  openModal() {
    this.modalService.open(this.content, { centered: true });
  }

  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
