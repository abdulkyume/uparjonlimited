import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventorydetails',
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
  templateUrl: './inventorydetails.component.html',
  styleUrls: ['./inventorydetails.component.scss'],
})
export class InventorydetailsComponent implements OnInit, OnDestroy {
  @Input() dataId: string = '';
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  userid: string = '';
  invDetList: any[] = [];
  shopSForm!: FormGroup;
  invDetailForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
  dropdownList1 = [];
  selectedItems1: any;

  private insService = inject(InventorySalesService);
  private formBuilder = inject(FormBuilder);

  get f() {
    return this.invDetailForm.controls;
  }

  ngOnInit(): void {
    this.invDetailSRefreshForm();
    this.getAllShop();
    this.invDetailRefreshForm();
  }

  invDetailSRefreshForm(): void {
    this.shopSForm = this.formBuilder.group({
      inventoryId: [this.dataId, [Validators.required]],
      type: [''],
      unit: [''],
    });
  }

  invDetailRefreshForm(): void {
    this.invDetailForm = this.formBuilder.group({
      id: [''],
      inventoryId: [this.dataId, [Validators.required]],
      type: ['PET', [Validators.required]],
      unit: ['Case', [Validators.required]],
      buy: [0, [Validators.required]],
      deleted: [false],
    });
  }

  toggleAddBtn(): void {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  onsubmit() {
    if (this.invDetailForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.invDetailForm.controls['id'].value) {
      this.insService
        .updateInvDet(this.invDetailForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.invDetailRefreshForm();
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
        .addInvDet(this.invDetailForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.invDetailRefreshForm();
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
      .getAllInvDet(
        0,
        10,
        this.shopSForm.controls['inventoryId'].value,
        this.shopSForm.controls['type'].value,
        this.shopSForm.controls['unit'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.invDetList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.invDetList.length;
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
      .getAllInvDet(
        this.page,
        this.pageSize,
        this.shopSForm.controls['inventoryId'].value,
        this.shopSForm.controls['type'].value,
        this.shopSForm.controls['unit'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.invDetList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.invDetList.length;
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
    this.invDetailForm.controls['id'].setValue(data.id);
    this.invDetailForm.controls['inventoryId'].setValue(data.inventoryId);
    this.invDetailForm.controls['type'].setValue(data.type);
    this.invDetailForm.controls['unit'].setValue(data.unit);
    this.invDetailForm.controls['buy'].setValue(data.buy);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteDue(id: string): void {
    this.loader = true;
    this.insService.deleteInvDet(id).subscribe({
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
