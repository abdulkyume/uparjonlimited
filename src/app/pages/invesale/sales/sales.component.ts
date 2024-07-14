import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { RoleService } from 'src/app/core/service/role.service';
import Swal from 'sweetalert2';
import { SearchComponent } from '../search/search.component';

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
    SearchComponent,
  ],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
})
export class SalesComponent implements OnInit, OnDestroy {
  currentPage: number = 0;
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
  slubForm!: FormGroup;
  slubExpenseForm!: FormGroup;
  slubReturnForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
  dropdownList1 = [];
  selectedItems1: any;
  selectedItems2: any;
  inventoryList = new Map();
  inventoryDetailList = new Map();
  inventoryPriceList = new Map();
  inventoryBuyList = new Map();
  shopList = new Map();
  dsoList = new Map();
  slubadderrorshow: boolean = false;
  slubExpenseAddErrorShow: boolean = false;
  slubReturnAddErrorShow: boolean = false;
  deletedData: any[] = [];
  totalAmount: number = 0;
  shopInfo: string = '';

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
    this.slubForm = this.formBuilder.group({
      slubFormVal: this.formBuilder.array([]),
    });
    this.slubExpenseForm = this.formBuilder.group({
      slubExpenseFormVal: this.formBuilder.array([]),
    });
    this.slubReturnForm = this.formBuilder.group({
      slubReturnFormVal: this.formBuilder.array([]),
    });
    this.getAllDSO();
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;

    this.saleSRefreshForm();
    this.getAllSales();
    this.salesRefreshForm();
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
          this.inventoryPriceList.set(content.id, content.sell);
          this.inventoryBuyList.set(content.id, content.buy ? content.buy : 0);
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
      dsoId: [''],
      orderId: [''],
      dateFrom: [this.currentdate],
      dateTo: [this.currentdate],
    });
  }

  salesRefreshForm(): void {
    this.salesForm = this.formBuilder.group({
      id: [''],
      date: [this.currentdate],
      dsoId: ['', [Validators.required]],
      amount: [this.totalAmount, [Validators.required]],
      freeItem: [0, [Validators.required]],
      discount: [0, [Validators.required]],
      totalExpense: [0, [Validators.required]],
      finalAmount: [0, [Validators.required]],
      inventoryOrderId: [''],
      dueAmount: [0],
      dueShopId: [''],
      expenseDetails: [],
      orderDetails: [],
      returnDetails: [],
      deleted: [false],
    });

    this.slubForm = this.formBuilder.group({
      slubFormVal: this.formBuilder.array([]),
    });
    this.slubExpenseForm = this.formBuilder.group({
      slubExpenseFormVal: this.formBuilder.array([]),
    });
    this.slubReturnForm = this.formBuilder.group({
      slubReturnFormVal: this.formBuilder.array([]),
    });
    this.selectedItems = [];
    this.selectedItems1 = [];
    this.selectedItems2 = [];
  }

  slubData(): FormArray {
    return this.slubForm.get('slubFormVal') as FormArray;
  }

  slubExpenseData(): FormArray {
    return this.slubExpenseForm.get('slubExpenseFormVal') as FormArray;
  }

  slubReturnData(): FormArray {
    return this.slubReturnForm.get('slubReturnFormVal') as FormArray;
  }

  toggleAddBtn(): void {
    if (this.showAddBtn) {
      this.showAddBtn = false;
    } else {
      this.showAddBtn = true;
    }
    this.salesRefreshForm();
    this.saleSRefreshForm();
  }

  onsubmit() {
    this.changeOnAmount();
    this.changeOnExpenseAmount();
    this.salesForm.controls['orderDetails'].setValue(this.slubData().value);
    this.salesForm.controls['expenseDetails'].setValue(
      this.slubExpenseData().value
    );
    this.salesForm.controls['returnDetails'].setValue(
      this.slubReturnData().value
    );
    this.loader = true;
    if (this.salesForm.controls['id'].value) {
      this.insService
        .updateSales(this.salesForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorMsg(res.reason);
            } else {
              this.successMsg(res.reason);
              this.salesRefreshForm();
              this.showAddBtn = true;
              this.getAllSales();
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
        .addSales(this.salesForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorMsg(res.reason);
            } else {
              this.successMsg(res.reason);
              this.salesRefreshForm();
              this.showAddBtn = true;
              this.getAllSales();
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

  getAllSales(): void {
    this.insService
      .getAllSales(
        this.page,
        this.pageSize,
        this.salesSForm.controls['dsoId'].value,
        this.salesSForm.controls['orderId'].value,
        this.salesSForm.controls['dateFrom'].value,
        this.salesSForm.controls['dateTo'].value
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

  slabRefreshForm(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      inventoryOrderId: [''],
      itemId: ['', [Validators.required]],
      quantity: [1, [Validators.required]],
      buy: [0, [Validators.required]],
      sell: [0, [Validators.required]],
      deleted: [false],
      active: [true],
    });
  }

  slabExpenseRefreshForm(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      orderNo: [''],
      name: ['', [Validators.required]],
      amount: [0, [Validators.required]],
      dsoId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      note: [''],
      deleted: [false],
      active: [true],
    });
  }

  addExpenseSlub(): void {
    let arr = this.slubExpenseData().value;
    if (arr.length > 0 && this.slubExpenseData().invalid) {
      this.slubExpenseAddErrorShow = true;
      return;
    }
    this.slubExpenseData().push(this.slabExpenseRefreshForm());
    this.slubExpenseAddErrorShow = false;
  }

  deleteExpenseSlub(i: number): void {
    let items = this.slubExpenseData().value;
    let j = 0;
    items.map((item: any) => {
      if (i == j && item.id) {
        item.deleted = true;
        this.deletedData.push(item);
      } else {
        j++;
      }
    });
    this.slubExpenseData().removeAt(i);
    this.changeOnExpenseAmount();
  }

  slabReturnRefreshForm(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      returnType: [''],
      orderId: [''],
      itemId: ['', [Validators.required]],
      quantity: [0, [Validators.required]],
      date: [this.currentdate, [Validators.required]],
      deleted: [false],
      active: [true],
    });
  }

  addReturnSlub(): void {
    let arr = this.slubReturnData().value;
    if (arr.length > 0 && this.slubReturnData().invalid) {
      this.slubReturnAddErrorShow = true;
      return;
    }
    this.slubReturnData().push(this.slabReturnRefreshForm());
    this.slubReturnAddErrorShow = false;
  }

  deleteReturnSlub(i: number): void {
    let items = this.slubReturnData().value;
    let j = 0;
    items.map((item: any) => {
      if (i == j && item.id) {
        item.deleted = true;
        this.deletedData.push(item);
      } else {
        j++;
      }
    });
    this.slubReturnData().removeAt(i);
    this.selectedItems2[i] = [];
  }

  addSlub(): void {
    let arr = this.slubData().value;
    if (arr.length > 0 && this.slubData().invalid) {
      this.slubadderrorshow = true;
      return;
    }
    this.slubData().push(this.slabRefreshForm());
    this.slubadderrorshow = false;
  }

  deleteSlub(i: number): void {
    let items = this.slubData().value;
    let j = 0;
    items.map((item: any) => {
      if (i == j && item.id) {
        item.deleted = true;
        this.deletedData.push(item);
      } else {
        j++;
      }
    });
    this.slubData().removeAt(i);
    this.selectedItems1[i] = [];
    this.changeOnAmount();
  }

  editDue(data: any): void {
    this.slubData().clear();
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

  autoAddSlab(): void {
    this.slubData().clear();
    this.addSlub();
  }

  deleteDue(id: string): void {
    this.loader = true;
    this.insService.deleteSales(id).subscribe({
      next: (res: any) => {
        this.getAllSales();
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

  changeOnAmount(): void {
    this.totalAmount = 0;
    this.slubData().controls.map((x) => {
      this.totalAmount +=
        this.inventoryPriceList.get(x.get('itemId')?.value) *
        +x.get('quantity')?.value;
      x.get('buy')?.setValue(
        this.inventoryBuyList.get(x.get('itemId')?.value) *
          +x.get('quantity')?.value
      );
      x.get('sell')?.setValue(
        this.inventoryPriceList.get(x.get('itemId')?.value) *
          +x.get('quantity')?.value
      );
    });
    this.f['amount'].setValue(this.totalAmount);
    this.f['finalAmount'].setValue(
      this.f['amount'].value - this.f['discount'].value
    );
  }

  changeOnExpenseAmount(): void {
    this.totalAmount = 0;
    this.slubExpenseData().controls.map((x) => {
      this.totalAmount += +x.get('amount')?.value;
    });
    this.f['totalExpense'].setValue(this.totalAmount);
  }

  next(): void {
    this.currentPage++;
  }
  previous(): void {
    this.currentPage--;
  }
  onPageChange(event: number): number {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllSales();
    return event;
  }

  onInitiatorItemSelect(item: any): void {
    this.f['dsoId'].setValue(item.id);
    this.autoAddSlab();
  }

  setShop(event: any): void {
    this.shopInfo = event.name + ' - ' + event.phoneNumber;
    this.f['dueShopId'].setValue(event.id);
  }

  onInitiatorItemUnSelect(item: any): void {
    this.f['dsoId'].setValue('');
  }

  onItemSelect1(item: any): void {
    this.f['itemId'].setValue(item.id);
  }

  onItemUnSelect1(item: any): void {
    this.f['itemId'].setValue('');
  }

  onInitiatorItemSelect1(item: any, i: any) {
    this.slubData().controls[i].patchValue({
      itemId: item.id,
    });
    this.changeOnAmount();
  }

  onInitiatorItemUnSelect1(item: any, i: any) {
    this.slubData().controls[i].patchValue({
      itemId: '',
    });
    this.changeOnAmount();
  }

  onInitiatorItemSelect2(item: any, i: any) {
    this.slubReturnData().controls[i].patchValue({
      itemId: item.id,
    });
  }

  onInitiatorItemUnSelect2(item: any, i: any) {
    this.slubReturnData().controls[i].patchValue({
      itemId: '',
    });
  }

  successMsg(message: string): void {
    Swal.fire('Success!', message, 'success');
  }

  errorMsg(message: string): void {
    Swal.fire('Ops!', message, 'error');
  }

  discountChange(val: any): void {
    if (+val.target.value < 0) {
      return;
    } else {
      this.f['finalAmount'].setValue(
        this.f['amount'].value - this.f['discount'].value
      );
    }
  }

  amountChange(val: any): void {
    if (+val.target.value < 0) {
      return;
    } else {
      this.f['finalAmount'].setValue(
        this.f['amount'].value - this.f['discount'].value
      );
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
