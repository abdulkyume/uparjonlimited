import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { RoleService } from 'src/app/core/service/role.service';
import Swal from 'sweetalert2';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LoaderComponent } from 'src/app/common/loader/loader.component';

@Component({
  selector: 'app-return',
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
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.scss'],
})
export class ReturnComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  userid: string = '';
  returnList: any[] = [];
  expenseSForm!: FormGroup;
  returnForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
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
    return this.returnForm.controls;
  }

  ngOnInit(): void {
    this.getAllInventory();
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
    this.returnSRefreshForm();
    this.getAllReturn();
    this.returnRefreshForm();
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
          this.inventoryDetailList.set(content.id, `${this.inventoryList.get(content.inventoryId)}<br/>${
              content.type
            }-${content.unit}`);
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

  returnSRefreshForm(): void {
    this.expenseSForm = this.formBuilder.group({
      returnType: ['OLD DAMAGE'],
      orderId: [''],
      dateFrom: [this.currentdate],
      dateTo: [this.currentdate],
    });
    this.selectedItems = [];
  }

  returnRefreshForm(): void {
    this.returnForm = this.formBuilder.group({
      id: [''],
      returnType: ['OLD DAMAGE'],
      orderId: [''],
      itemId: [''],
      amount: [''],
      date: [this.currentdate],
      voucherDate: [''],
      deleted: [false],
    });
    this.selectedItems = [];
  }

  toggleAddBtn(): void {
    if (this.showAddBtn) {
      this.showAddBtn = false;
    } else {
      this.showAddBtn = true;
    }
    this.returnRefreshForm();
    this.returnSRefreshForm();
  }

  onsubmit() {
    if (this.returnForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.returnForm.controls['id'].value) {
      this.insService
        .updateReturn(this.returnForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.returnRefreshForm();
              this.showAddBtn = true;
              this.getAllReturn();
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
        .addReturn(this.returnForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.returnRefreshForm();
              this.showAddBtn = true;
              this.getAllReturn();
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

  getAllReturn(): void {
    this.insService
      .getAllReturn(
        this.page,
        this.pageSize,
        this.expenseSForm.controls['returnType'].value,
        this.expenseSForm.controls['orderId'].value,
        this.expenseSForm.controls['dateFrom'].value,
        this.expenseSForm.controls['dateTo'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.returnList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.returnList.length;
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

  editExpense(data: any) {
    this.selectedItems = this.dropdownList.filter(
      (item: any) => item.id === data.itemId
    );
    this.returnForm.controls['id'].setValue(data.id);
    this.returnForm.controls['returnType'].setValue(data.returnType);
    this.returnForm.controls['orderId'].setValue(data.orderId);
    this.returnForm.controls['itemId'].setValue(data.itemId);
    this.returnForm.controls['amount'].setValue(data.amount);
    this.returnForm.controls['date'].setValue(data.date.split('T')[0]);
    this.returnForm.controls['voucherDate'].setValue(data.voucherDate.split('T')[0]);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteExpense(id: string): void {
    this.loader = true;
    this.insService.deleteReturn(id).subscribe({
      next: (res: any) => {
        this.getAllReturn();
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
    this.getAllReturn();
    return event;
  }

  onInitiatorItemSelect(item: any): void {
    this.f['itemId'].setValue(item.id);
  }

  onInitiatorItemUnSelect(item: any): void {
    this.f['itemId'].setValue('');
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
