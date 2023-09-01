import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import MetisMenu from 'metismenujs';
import { SimplebarAngularModule } from 'simplebar-angular';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/service/auth.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SimplebarAngularModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  @ViewChild('componentRef') scrollRef: any;
  @Input() isCondensed = false;
  menu: any;
  data: any;
  role: string = '';

  menuItems: any;

  @ViewChild('sideMenu') sideMenu!: ElementRef;

  constructor(
    private defaultService: AuthService,
    private router: Router,
    private encryptionService: EncryptionService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    this.role = this.encryptionService.decrypt(localStorage.getItem('role')!);
    let fetchmenu = this.encryptionService.decrypt(
      localStorage.getItem('isfetchmenu')!
    );

    if (fetchmenu === 'YES') {
      this.getRoleWiseMenu();
    }
    else {
      this.initialize();
    }

    this._scrollElement();
  }
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName('mm-active').length > 0) {
        const currentPosition = (
          document.getElementsByClassName('mm-active')[0] as HTMLElement
        )['offsetTop'];
        if (currentPosition > 500)
          if (this.scrollRef.SimpleBar !== null)
            this.scrollRef.SimpleBar.getScrollElement().scrollTop =
              currentPosition + 300;
      }
    }, 300);
  }

  getRoleWiseMenu() {
    this.defaultService.getRoleWiseMenu().subscribe((res: any) => {
      let keepParentMenus = res.data.filter((x: any) => x.parentId === "");
      keepParentMenus.forEach((x: any) => {
        x.subItems = [];
      });

      let [...generateMenu] = keepParentMenus;
      // let generateArr = () => {
      res.data.forEach((x: any) => {
        let resIndex = keepParentMenus.findIndex(
          (e: any) => e.id === x.parentId
        );
        if (resIndex > -1) {
          generateMenu[resIndex].subItems.push(x);
        }
      });
      //  }
      this.menuItems = generateMenu;
      
      localStorage.setItem(
        'menus',
        this.encryptionService.encrypt(JSON.stringify(generateMenu))
      );
      localStorage.setItem('isfetchmenu', this.encryptionService.encrypt('NO'));
      window.location.reload();
      // this.menuItems = JSON.parse(localStorage.getItem("menus"));
    });
  }
  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event: any) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if ((!this.isCondensed && this.sideMenu) || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className: any) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    // tslint:disable-next-line: prefer-for-of
    const paths = [];
    for (let i = 0; i < links.length; i++) {
      const link = links[i] as HTMLAnchorElement;
      paths.push(link['pathname']);
    }
    var itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('mm-active');
        const parent2El = parentEl.parentElement!.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;
          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');
            if (childAnchor) {
              childAnchor.classList.add('mm-active');
            }
            if (childDropdown) {
              childDropdown.classList.add('mm-active');
            }
            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') {
                  childanchor.classList.add('mm-active');
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Initialize
   */
  initialize(): void {
    this.menuItems = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('menus')!)
    );
  }



  hasItems(item: any) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
  isAdmin(item: any) {
    let rolechk = parseInt(this.role);
    let ret = item.admin !== undefined ? rolechk !== 2 && rolechk !== 1 : false;
    return ret;
  }

  roleCheck(item: any) {
    let rolechk = parseInt(this.role);
    const found = item.role.find((element: any) => element == rolechk);
    let ret = found ? true : false;
    return ret;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
