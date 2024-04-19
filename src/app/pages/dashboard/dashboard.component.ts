import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/core/service/event.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { MerchantService } from 'src/app/core/service/merchant.service';

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
  roleId!: string;
  totalOrder: number = 0;
  totalDelivered: number = 0;
  todayOrder: number = 0;
  todayApprove: number = 0;
  todayCanceled: number = 0;
  merchantMobile: string = '';

  @ViewChild('content') content: any;
  constructor(
    private modalService: NgbModal,
    private eventService: EventService,
    private authService: AuthService,
    private encryptionService: EncryptionService,
    private merchantService: MerchantService
  ) {}

  ngOnInit() {
    this.roleId = this.encryptionService.decrypt(localStorage.getItem('role')!);
    const attribute = document.body.getAttribute('data-layout')!;
    this.merchantMobile = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).mobile;
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
    this.getMerchantOrderInfos();
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

  getMerchantOrderInfos() {
    this.merchantService.getMerchantInfo(this.merchantMobile).subscribe({
      next: (res: any) => {
        this.totalOrder = res.data[0].total_orders
        this.totalDelivered = res.data[0].total_delivered_orders
        this.todayApprove = res.data[0].todays_approved_orders
        this.todayCanceled = res.data[0].todays_cancelled_orders
        this.todayOrder = res.data[0].todays_orders
      },
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {},
    });
  }
}
