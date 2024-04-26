import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from 'src/app/core/service/order.service';
import { EncryptionService } from '../../../core/service/encryption.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import { MerchantService } from 'src/app/core/service/merchant.service';
import Swal from 'sweetalert2';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    NgbPaginationModule,
    NgbDropdownModule,
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  showAddBtn: boolean = true;
  slubadderrorshow: boolean = false;
  orderForm!: FormGroup;
  searchForm!: FormGroup;
  slubForm!: FormGroup;
  userId: string = '';
  roleId: string = '';
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal!: number;
  total!: number;
  deletedData: any[] = [];

  orderList: any;
  merchantList: any;
  itemList: any;

  dropdownSettings = {};
  dropdownList = [];
  selectedItems = [];
  dropdownList1: any;
  selectedItems1: any = [];

  currentDate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private encryptionService: EncryptionService,
    private configService: ConfigurationService,
    private merchantService: MerchantService
  ) {}

  ngOnInit(): void {
    this.userId = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    this.roleId = this.encryptionService.decrypt(localStorage.getItem('role')!);

    this.slubForm = this.formBuilder.group({
      slubFormVal: this.formBuilder.array([]),
    });

    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };

    this.orderRefreshForm();
    this.searchRefreshForm();
    this.getAllMerchant();
  }

  getAllMerchant() {
    this.loader = true;
    if (this.merchantService.merchantList.value && this.merchantService.merchantListC.value) {
      this.merchantService.merchantList.subscribe((li) => {
        this.dropdownList = li;
      });
      this.merchantService.merchantListC.subscribe((li) => {
        this.merchantList = li;
      });
      this.loader = false;
    } else {
      let merchantDetailsList: any = [];
      this.merchantService
        .getMerchantDetail('', this.page, 1000, '')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            this.merchantList = res.data.content;
            this.merchantService.merchantListC.next(this.merchantList);
            res.data.content.map((merchant: any) => {
              merchantDetailsList.push({
                id: merchant.id,
                customtext: merchant.name + ' - ' + merchant.phoneNumber,
              });
            });
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.dropdownList = merchantDetailsList;
            this.merchantService.merchantList.next(this.dropdownList);
            this.getItemList();
          },
        });
    }
  }

  getItemList() {
    if (this.configService.allItem.value) {
      this.itemList = this.configService.allItem.subscribe((item: any) => {
        this.dropdownList1 = item;
      });
      this.loader = false;
    } else {
      let ilist: any[] = [];
      this.configService.getAllItem(0, 1000, '').subscribe({
        next: (res: any) => {
          res.data.content.map((x: any) => {
            ilist.push({
              id: x.id,
              customtext: `${x.name}-${x.price}`,
            });
          });
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {
          this.dropdownList1 = ilist;
          this.configService.allItem.next(this.dropdownList1);
          this.getAllOrderList();
        },
      });
    }
  }

  orderRefreshForm() {
    this.orderForm = this.formBuilder.group({
      id: [null],
      userId: [this.userId, [Validators.required]],
      orderDate: [this.currentDate, [Validators.required]],
      otherNote: [''],
      paymentTypeId: ['COD Received'],
      receivedAmount: [0, [Validators.required]],
      merchantId: ['', [Validators.required]],
      orderDetails: [],
    });
    this.selectedItems = [];
    this.selectedItems1 = [];
  }

  submitOrder() {
    this.orderForm.controls['orderDetails'].setValue(this.slubData().value);
    if (
      this.orderForm.invalid ||
      this.orderForm.controls['orderDetails'].value?.length < 1
    ) {
      return;
    }
    if (this.orderForm.controls['id'].value) {
      this.loader = true;
      this.orderForm.controls['orderDetails'].value.map((d: any) => {
        let ids = this.dropdownList1.filter(
          (idsd: any) => idsd.id === d.itemId
        );
        d.amount = d.quantity * ids[0].customtext.split('-')[1];
      });
      this.orderForm.controls['orderDetails'].setValue(
        this.slubData().value.concat(this.deletedData)
      );
      this.orderService
        .updateOrder(this.orderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.successMsg(res.message);
              this.orderRefreshForm();
              this.showAddBtn = true;
            } else {
              this.errorsMsg(res.message);
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.getAllOrderList();
            this.loader = false;
          },
        });
    } else {
      this.loader = true;
      this.orderForm.controls['orderDetails'].value.map((d: any) => {
        let ids = this.dropdownList1.filter(
          (idsd: any) => idsd.id === d.itemId
        );
        d.amount = d.quantity * ids[0].customtext.split('-')[1];
      });
      this.orderService
        .addOrder(this.orderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.successMsg(res.message);
              this.orderRefreshForm();
              this.showAddBtn = false;
            } else {
              this.errorsMsg(res.message);
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

  successMsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }

  errorsMsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  get f() {
    return this.orderForm.controls;
  }

  get sf() {
    return this.searchForm.controls;
  }

  slubData(): FormArray {
    return this.slubForm.get('slubFormVal') as FormArray;
  }

  setnameforstakeholder(event: any, index: any) {
    let f = this.merchantList.filter((x: any) => x.id == event);
    this.slubData().controls[index].patchValue({
      TransactionFeeStakeHolderName: f[0].stakeholderName,
    });
  }

  onInitiatorItemSelect(item: any) {
    this.f['merchantId'].setValue(item.id);
  }

  onInitiatorItemUnSelect(item: any) {
    this.f['merchantId'].setValue('');
  }

  onInitiatorItemSelect1(item: any, i: any) {
    this.slubData().controls[i].patchValue({
      itemId: item.id,
    });
  }

  onInitiatorItemUnSelect1(item: any, i: any) {
    this.slubData().controls[i].patchValue({
      itemId: '',
    });
  }

  searchRefreshForm() {
    this.searchForm = this.formBuilder.group({
      fromdate: [`${this.currentDate}`],
      todate: [`${this.currentDate}`],
    });
  }

  getAllOrderList() {
    let isUser = this.userId;
    if (this.roleId === '1143fcc9-02d1-4bd0-ab47-b5efc92072fc') {
      isUser = '';
    }
    this.orderService
      .getAllOrder(
        this.page,
        this.pageSize,
        this.sf['fromdate'].value,
        this.sf['todate'].value,
        isUser
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.orderList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.orderList.length;
          }
        },
        error: (err) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.getItemList();
        },
      });
  }

  toggleAddOrderBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  slabRefreshForm(): FormGroup {
    return this.formBuilder.group({
      id: [],
      orderId: [],
      itemId: ['', [Validators.required]],
      quantity: [1, [Validators.required]],
      amount: [],
      deleted: [false],
      active: [true],
    });
  }

  getMerchantName(id: string): string {
    let d = this.merchantList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].name;
    }
    return '';
  }

  editOrder(data: any) {
    this.slubData().clear();

    this.orderForm.controls['id'].setValue(data.id);
    this.orderForm.controls['receivedAmount'].setValue(data.receivedAmount);
    this.orderForm.controls['otherNote'].setValue(data.otherNote);
    this.orderForm.controls['paymentTypeId'].setValue(data.paymentTypeId);
    this.orderForm.controls['merchantId'].setValue(data.merchantId);
    this.orderForm.controls['orderDate'].setValue(data.orderDate);
    this.selectedItems = this.dropdownList.filter(
      (dta: any) => dta.id == data.merchantId
    );
    this.getOrderDetail(data.orderDate, data.id);
    this.showAddBtn = false;
  }

  setOrderNameInUI(data: any, i: any) {
    this.selectedItems1[i] = this.dropdownList1.filter(
      (x: any) => x.id == data.itemId
    );
  }

  getOrderDetail(date: string, orderId: string) {
    this.loader = true;
    this.orderService
      .getAllOrderDetail(date, date, this.userId, orderId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            let data = res.data;
            let i = 0;
            data.map((value: any) => {
              this.setOrderNameInUI(value, i);
              this.slubData().push(
                this.formBuilder.group({
                  id: [value.id],
                  amount: [value.amount],
                  orderId: [value.orderId],
                  quantity: [value.quantity],
                  itemId: [value.itemId],
                  deleted: [value.deleted],
                })
              );
              i++;
            });
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

  getMerchantMobile(id: string): string {
    let d = this.merchantList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].phoneNumber;
    }
    return '';
  }

  addSlub() {
    let arr = this.slubData().value;
    if (arr.length > 0 && this.slubData().invalid) {
      this.slubadderrorshow = true;
      return;
    }

    this.slubData().push(this.slabRefreshForm());
    this.slubadderrorshow = false;
  }

  deleteSlub(i: number) {
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
  }

  autoAddSlab() {
    this.slubData().clear();
    this.addSlub();
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllMerchant();
    return event;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
