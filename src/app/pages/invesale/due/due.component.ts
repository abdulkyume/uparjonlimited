import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { NgbDropdownModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { RoleService } from 'src/app/core/service/role.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-due',
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
  templateUrl: './due.component.html',
  styleUrls: ['./due.component.scss'],
})
export class DueComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  userid: string = '';
  dueList: any[] = [];
  dueSForm!: FormGroup;
  dueForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
  dropdownList1 = [];
  selectedItems1: any;
  dropdownList2 = [];
  selectedItems2: any;
  inventoryList = new Map();

  private insService = inject(InventorySalesService);
  private roleService = inject(RoleService);
  private encryptionService = inject(EncryptionService);
  private formBuilder = inject(FormBuilder);

  get f() {
    return this.dueForm.controls;
  }

  ngOnInit(): void {
    this.getAllShop();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'value',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
    this.getAllDSO();
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;

    this.dueSRefreshForm();
    this.getAllDue();
    this.dueRefreshForm();
    this.getAllInventory();
  }

  getAllInventory(): void {
    this.insService.getAllInventory(-1, 0).subscribe({
      next: (res: any) => {
        res.data.map((content: any) => {
          this.inventoryList.set(content.id, content.name);
        });
      },
      error: (error: any) => {
        this.loader = false;
        console.error('Error:', error);
      },
      complete: () => {
        this.getAllInventoryItem();
      },
    });
  }

  getAllInventoryItem(): void {
    let data: any = [];
    this.insService.getAllInvDet(-1, 0).subscribe({
      next: (res: any) => {
        res.data.map((content: any) => {
          data.push({
            id: content.id,
            value: `${this.inventoryList.get(content.inventoryId)}-${
              content.type
            }-${content.unit}`,
          });
        });
      },
      error: (error: any) => {
        this.loader = false;
        console.error('Error:', error);
      },
      complete: () => {
        this.dropdownList1 = data;
      },
    });
  }

  getAllDSO(): void {
    let data: any = [];
    this.roleService
      .getAllusers(0, 1000, '', 'e4151052-bf99-947b-1c8e-ee934cc685d5')
      .subscribe({
        next: (res: any) => {
          res.data.content.map((content: any) => {
            data.push({
              id: content.id,
              value: `${content.firstName} ${content.lastName} - ${content.mobile}`,
            });
          });
        },
        error: (error: any) => {
          this.loader = false;
          console.error('Error:', error);
        },
        complete: () => {
          this.dropdownList = data;
        },
      });
  }

  dueSRefreshForm(): void {
    this.dueSForm = this.formBuilder.group({
      dsoId: [this.userid],
      inventoryItemId: [''],
      shopId: [''],
      orderId: [''],
    });
    this.selectedItems = [];
    this.selectedItems1 = [];
    this.selectedItems2 = [];
  }

  dueRefreshForm(): void {
    this.dueForm = this.formBuilder.group({
      id: [''],
      dueAmount: [0],
      inventoryItemId: ['', [Validators.required]],
      shopId: ['', [Validators.required]],
      orderId: [''],
      dsoId: ['', [Validators.required]],
      deleted: [false],
    });
    this.selectedItems = [];
    this.selectedItems1 = [];
    this.selectedItems2 = [];
  }

  toggleAddBtn(): void {
    if (this.showAddBtn) {
      this.showAddBtn = false;
    } else {
      this.showAddBtn = true;
    }
    this.dueRefreshForm();
    this.dueSRefreshForm();
  }

  onsubmit() {
    if (this.dueForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.dueForm.controls['id'].value) {
      this.insService
        .updateDue(this.dueForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.dueRefreshForm();
              this.showAddBtn = true;
              this.getAllDue();
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
        .addDue(this.dueForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.dueRefreshForm();
              this.showAddBtn = true;
              this.getAllDue();
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

  getAllDue(): void {
    this.insService
      .getAllDue(
        this.page,
        this.pageSize,
        this.dueSForm.controls['inventoryItemId'].value,
        this.dueSForm.controls['shopId'].value,
        this.dueSForm.controls['orderId'].value,
        this.dueSForm.controls['dsoId'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.dueList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.dueList.length;
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
    let data: any = [];
    this.insService
      .getAllShop(-1, -1, '')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          res.data.map((content: any) => {
            data.push({
              id: content.id,
              value: `${content.name} - ${content.phoneNumber}`,
            });
          });
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.dropdownList2 = data;
          this.loader = false;
        },
      });
  }

  editDue(data: any) {
    this.selectedItems = this.dropdownList.filter(
      (item: any) => item.id === data.dsoId
    );
    this.selectedItems1 = this.dropdownList1.filter(
      (item: any) => item.id === data.inventoryItemId
    );
    this.selectedItems2 = this.dropdownList2.filter(
      (item: any) => item.id === data.shopId
    );
    this.dueForm.controls['id'].setValue(data.id);
    this.dueForm.controls['dueAmount'].setValue(data.dueAmount);
    this.dueForm.controls['inventoryItemId'].setValue(data.inventoryItemId);
    this.dueForm.controls['shopId'].setValue(data.shopId);
    this.dueForm.controls['orderId'].setValue(data.orderId);
    this.dueForm.controls['dsoId'].setValue(data.dsoId);
    this.dueForm.controls['deleted'].setValue(data.deleted);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteDue(id: string): void {
    this.loader = true;
    this.insService.deleteDue(id).subscribe({
      next: (res: any) => {
        this.getAllDue();
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
    this.getAllDue();
    return event;
  }

  onInitiatorItemSelect(item: any): void {
    this.f['dsoId'].setValue(item.id);
  }

  onInitiatorItemUnSelect(item: any): void {
    this.f['dsoId'].setValue('');
  }

  onInitiatorItemSelect1(item: any): void {
    this.f['inventoryItemId'].setValue(item.id);
  }

  onInitiatorItemUnSelect1(item: any): void {
    this.f['inventoryItemId'].setValue('');
  }

  onInitiatorItemSelect2(item: any): void {
    this.f['shopId'].setValue(item.id);
  }

  onInitiatorItemUnSelect2(item: any): void {
    this.f['shopId'].setValue('');
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
