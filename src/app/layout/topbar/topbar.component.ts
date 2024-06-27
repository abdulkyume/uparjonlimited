import {
  Component,
  EventEmitter,
  Inject,
  Output,
  HostListener,
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/service/auth.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { RoleService } from 'src/app/core/service/role.service';
import { MerchantService } from 'src/app/core/service/merchant.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    SimplebarAngularModule,
    NgbDropdownModule,
    RouterModule,
  ],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  private ngUnsubscribe: Subject<any> = new Subject();
  element!: any;
  cookieValue!: any;
  flagvalue!: any;
  countryName!: any;
  valueset!: any;

  username: string = '';
  role: string = '';

  userRole: string = '';
  user: any;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService,
    private encryptionService: EncryptionService,
    private merchantService: MerchantService
  ) {}
  @HostListener('window:storage', ['$event']) checkLoggedIn(event: Storage) {
    if (event['storageArea'] == localStorage) {
      localStorage.getItem('currentUser') ?? this.authService.logout();
    }
  }

  openMobileMenu!: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
    if (localStorage.getItem('currentUser')!) {
      this.user = JSON.parse(
        this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
      );
    } else {
      this.authService.logout();
    }
    if (localStorage.getItem('allroleid') == null) {
      this.roleService.getAllRoleIds().subscribe((res: any) => {
        localStorage.setItem(
          'allroleid',
          this.encryptionService.encrypt(JSON.stringify(res.data))
        );
      });
    }

    this.roleService.getAllRoleIds().subscribe((res: any) => {
      localStorage.setItem(
        'allroleid',
        this.encryptionService.encrypt(JSON.stringify(res.data))
      );
    });

    setTimeout(() => {
      if (localStorage.getItem('allroleid')!) {
        this.userRole = JSON.parse(
          this.encryptionService.decrypt(localStorage.getItem('allroleid')!)
        ).filter(
          (role: any) =>
            role.id ===
            +this.encryptionService.encrypt(localStorage.getItem('role')!)
        )[0]?.roleName;
      } else {
        this.authService.logout();
      }
    }, 2000);
    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.username = this.encryptionService
      .decrypt(localStorage.getItem('username')!)
      .replace(/^"(.*)"$/, '$1');

    this.getAllmerchant();
  }

  getAllmerchant() {
    this.merchantService
      .getMerchantDetail('', 0, 1000, this.user.mobile)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          let merchant = res.data.content;
          if (merchant.length > 0) {
            localStorage.setItem(
              'currentMerchant',
              this.encryptionService.encrypt(JSON.stringify(merchant[0]))
            );
          }
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {},
      });
  }
  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/account/login']);
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement &&
      !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement
    ) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }
}
