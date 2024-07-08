import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { RoleService } from 'src/app/core/service/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales',
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
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
})
export class SalesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  userid: string = '';
  salesList: any[] = [];
  salesSForm!: FormGroup;
  salesForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
  dropdownList1 = [];
  selectedItems1: any;
  inventoryList = new Map();
  inventoryDetailList = new Map();
  shopList = new Map();
  dsoList = new Map();
  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;


  private insService = inject(InventorySalesService);
  private roleService = inject(RoleService);
  private encryptionService = inject(EncryptionService);
  private formBuilder = inject(FormBuilder);

  get f() {
    return this.salesForm.controls;
  }

  ngOnInit(): void {
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

    this.saleSRefreshForm();
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
          let a = {
            id: content.id,
            value: `${this.inventoryList.get(content.inventoryId)}-${
              content.type
            }-${content.unit}`,
          };
          this.inventoryDetailList.set(
            content.id,
            `${this.inventoryList.get(content.inventoryId)}<br/>${
              content.type
            }-${content.unit}`
          );
          data.push(a);
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
            let a = {
              id: content.id,
              value: `${content.firstName} ${content.lastName}\n${content.mobile}`,
            };
            this.dsoList.set(
              content.id,
              `${content.firstName} ${content.lastName}<br/>${content.mobile}`
            );
            data.push(a);
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

  saleSRefreshForm(): void {
    this.salesSForm = this.formBuilder.group({
      dsoId: [this.userid],
      inventoryItemId: [''],
      shopId: [''],
      orderId: [''],
      dateFrom:[this.currentdate],
      dateTo:[this.currentdate]
    });
    this.selectedItems = [];
    this.selectedItems1 = [];
  }

  dueRefreshForm(): void {
    this.salesForm = this.formBuilder.group({
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
  }

  toggleAddBtn(): void {
    if (this.showAddBtn) {
      this.showAddBtn = false;
    } else {
      this.showAddBtn = true;
    }
    this.dueRefreshForm();
    this.saleSRefreshForm();
  }

  onsubmit() {
    if (this.salesForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.salesForm.controls['id'].value) {
      this.insService
        .updateDue(this.salesForm.value)
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
        .addDue(this.salesForm.value)
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
        this.salesSForm.controls['inventoryItemId'].value,
        this.salesSForm.controls['shopId'].value,
        this.salesSForm.controls['orderId'].value,
        this.salesSForm.controls['dsoId'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.salesList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.salesList.length;
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
    this.selectedItems = this.dropdownList.filter(
      (item: any) => item.id === data.dsoId
    );
    this.selectedItems1 = this.dropdownList1.filter(
      (item: any) => item.id === data.inventoryItemId
    );
    this.salesForm.controls['id'].setValue(data.id);
    this.salesForm.controls['dueAmount'].setValue(data.dueAmount);
    this.salesForm.controls['inventoryItemId'].setValue(data.inventoryItemId);
    this.salesForm.controls['shopId'].setValue(data.shopId);
    this.salesForm.controls['orderId'].setValue(data.orderId);
    this.salesForm.controls['dsoId'].setValue(data.dsoId);
    this.salesForm.controls['deleted'].setValue(data.deleted);
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
