import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/service/auth.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { RoleService } from 'src/app/core/service/role.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, SimplebarAngularModule, NgbDropdownModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  element!: any;
  cookieValue!: any;
  flagvalue!: any;
  countryName!: any;
  valueset!: any;

  username: string = '';
  role: string = '';

  userRole: string = '';

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService,
    private encryptionService: EncryptionService
  ) { }

  openMobileMenu!: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
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
      this.userRole = JSON.parse(
        this.encryptionService.decrypt(localStorage.getItem('allroleid')!)
      ).filter(
        (role: any) =>
          role.id ===
          +this.encryptionService.encrypt(localStorage.getItem('role')!)
      )[0]?.roleName;
    }, 2000);
    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.username = this.encryptionService
      .decrypt(localStorage.getItem('username')!)
      .replace(/^"(.*)"$/, '$1');
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
