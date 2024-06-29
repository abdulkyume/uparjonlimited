import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { RoleService } from 'src/app/core/service/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    NgbPagination,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgMultiSelectDropDownModule,
    FormsModule,
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  userid: string = '';
  shopList: any[] = [];
  shopSForm!: FormGroup;
  shopForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
  dropdownList1 = [];
  selectedItems1: any;

  private insService = inject(InventorySalesService);
  private encryptionService = inject(EncryptionService);
  private formBuilder = inject(FormBuilder);

  get f() {
    return this.shopForm.controls;
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'value',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;

    this.shopSRefreshForm();
    this.getAllShop();
    this.shopRefreshForm();
  }

  shopSRefreshForm(): void {
    this.shopSForm = this.formBuilder.group({
      phoneNumber: [''],
    });
  }

  shopRefreshForm(): void {
    this.shopForm = this.formBuilder.group({
      id: [''],
      name: [''],
      phoneNumber: [''],
      address: [''],
      deleted: [false],
    });
  }

  toggleAddBtn(): void {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  onsubmit() {
    if (this.shopForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.shopForm.controls['id'].value) {
      this.insService
        .updateShop(this.shopForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.shopRefreshForm();
              this.showAddBtn = true;
              this.getAllShop();
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.loader = false;
          },
        });
    } else {
      this.insService
        .addShop(this.shopForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.shopRefreshForm();
              this.showAddBtn = true;
              this.getAllShop();
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.loader = false;
          },
        });
    }
  }

  searchInv() {
    this.loader = true;
    this.insService
      .getAllShop(
        0,
        10,
        this.shopSForm.controls['phoneNumber'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.shopList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.shopList.length;
          }
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.loader = false;
        },
      });
  }

  getAllShop(): void {
    this.insService
      .getAllShop(
        this.page,
        this.pageSize,
        this.shopSForm.controls['phoneNumber'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.shopList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.shopList.length;
          }
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.loader = false;
        },
      });
  }

  editDue(data: any) {
    this.shopForm.controls['id'].setValue(data.id);
    this.shopForm.controls['name'].setValue(data.name);
    this.shopForm.controls['phoneNumber'].setValue(data.phoneNumber);
    this.shopForm.controls['address'].setValue(data.address);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteDue(id: string): void {
    this.loader = true;
    this.insService.deleteShop(id).subscribe({
      next: (res: any) => {
        if (!res) {
          this.getAllShop();
        }
      },
      error: (err: any) => {
        console.error(err);
        this.loader = false;
      },
      complete: () => {
        this.loader = false;
      },
    });
  }

  onPageChange(event: number): number {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllShop();
    return event;
  }

  successmsg(message: string): void {
    Swal.fire('Success!', message, 'success');
  }

  errorssmsg(message: string): void {
    Swal.fire('Ops!', message, 'error');
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
