import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { Baseresponsewlist } from 'src/app/core/models/baseresponsewlist';
import { Baseresponse } from 'src/app/core/models/baseresponse';
import { RoleService } from 'src/app/core/service/role.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    NgbPaginationModule,
    LoaderComponent,
    UiSwitchModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  addUserFormShow: boolean = false;
  createUserForm!: FormGroup;
  searchUserForm!: FormGroup;
  addUserBtnShow: boolean = true;
  existingUserListShow: boolean = true;
  existingUserList!: any;
  allroles!: any;
  loader: boolean = true;

  total: number = 0;
  pagea: number = 1;
  pageSizes = 10;
  cPageVal!: number;
  toPageVal!: number;

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private authService: AuthService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.createUserFormRefresh();
    this.cPageVal = this.pagea;
    this.toPageVal = this.pageSizes;
    this.getAllRoleIds();
    this.getAllusers();
    this.searchUserForm = this.formBuilder.group({
      usernumbersearch: [
        '',
        [
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/(^(01){1}[3-9]{1}\d{8})$/),
        ],
      ],
    });
  }
  @HostListener('window:storage', ['$event']) checkLoggedIn(event: Storage) {
    if (event['storageArea'] == localStorage) {
      localStorage.getItem('currentUser') ?? this.authService.logout();
    }
  }

  createUserFormRefresh() {
    this.createUserForm = this.formBuilder.group({
      id: [null],
      uname: ['', [Validators.required]],
      fname: ['', [Validators.required]],
      lname: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      email: ['', [Validators.required]],
      mobile: [
        '',
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.pattern(/(^(01){1}[3-9]{1}\d{8})$/),
        ],
      ],
      role: ['', [Validators.required]],
      password: ['uparjon'],
      active: [true],
      deleted: [false]
    });
  }
  get f() {
    return this.createUserForm.controls;
  }
  editUser(user: any) {
    this.f['id'].setValue(user.id);
    this.f['uname'].setValue(user.username);
    this.f['fname'].setValue(user.firstName);
    this.f['lname'].setValue(user.lastName);
    this.f['mobile'].setValue(user.mobile);
    this.f['email'].setValue(user.email);
    this.f['role'].setValue(user.roleId);
    this.f['active'].setValue(user.active);
    this.f['deleted'].setValue(user.deleted);
    if (!this.addUserFormShow) {
      this.addUserBtn();
    }
  }
  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }
  createUserFormSubmit() {
    if (this.createUserForm.valid) {
      this.loader = true;
      if (this.f['id'].value) {
        let requestForm = {
          id: this.f['id'].value,
          uname: this.f['uname'].value,
          userPhone: this.f['userPhone'].value,
          role: this.f['role'].value,
          isActive: this.f['isActive'].value,
          isDeleted: false,
          isPasswordChanged: false,
        };
        this.roleService
          .updateUser(requestForm)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res: any) => {
              if (!res.isSuccess) {
                this.loader = false;
                this.errorssmsg(
                  res.reason ? res.reason : 'User Upadate Failed'
                );
              } else {
                this.successmsg(
                  res.reason ? res.reason : 'User Upadated Successfully'
                );
                this.createUserFormRefresh();
                this.addUserBtn();
                this.getAllusers();
              }
            },
            error: (err) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => { },
          });
      } else {
        this.roleService
          .createUser(this.createUserForm.value)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res: any) => {
              if (!res.isSuccess) {
                this.loader = false;
                this.errorssmsg(res.reason);
              } else {
                this.successmsg(res.reason);
                this.createUserFormRefresh();
                this.addUserBtn();
                this.getAllusers();
              }
            },
            error: (err) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => { },
          });
      }
    } else {
      return;
    }
  }
  onClear() {
    this.createUserFormRefresh();
  }
  addUserBtn() {
    if (this.addUserFormShow) {
      this.addUserFormShow = false;
      this.addUserBtnShow = true;
      this.existingUserListShow = true;
    } else {
      this.addUserFormShow = true;
      this.addUserBtnShow = false;
      this.existingUserListShow = false;
    }
  }

  getAllRoleIds() {
    if (localStorage.getItem('allroleid') == null) {
      this.roleService
        .getAllRoleIds()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: Baseresponse<any>) => {
            this.allroles = res.data;
            localStorage.setItem(
              'allroleid',
              this.encryptionService.encrypt(JSON.stringify(this.allroles))
            );
          },
          error: (err) => {
            console.error(err);
          },
        });
    } else {
      this.allroles = JSON.parse(
        this.encryptionService.decrypt(localStorage.getItem('allroleid')!)
      );
    }
  }
  // getAllRoleId() {
  //   this.roleService.getAllRoleId().subscribe((res: any) => {
  //     this.allroles = res.data;
  //   });
  // }

  getAllusers() {
    this.roleService
      .getAllusers(this.pagea-1, this.pageSizes)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.existingUserList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          }
        },
        error: (err) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.loader = false;
        },
      });
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSizes;
    this.pagea = event;

    this.cPageVal = (event - 1) * this.pageSizes + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllusers();
    return event;
  }

  searchUser() {
    if (this.searchUserForm.invalid) {
      return;
    }
    this.loader = true;
    this.roleService
      .getAllusers(
        this.pagea,
        this.pageSizes,
        this.fsu['usernumbersearch'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.existingUserList = res.data.content;
          this.total = res.data.total!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          }
        },
        error: (err) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.loader = false;
        },
      });
  }

  get fsu() {
    return this.searchUserForm.controls;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
