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
import { filter } from 'rxjs/operators';

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
  slubform!: FormGroup;
  userid: string = '';
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

  currentdate: string = `${new Date().getFullYear()}-${String(
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
    this.getitemlist();
    this.getAllmerchant();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    this.slubform = this.formBuilder.group({
      slubformval: this.formBuilder.array([]),
    });

    this.orderRefreshForm();
    this.searchRefreshForm();
  }

  getAllmerchant() {
    let merchantdetailsList: any = [];
    this.merchantService
      .getMerchantDetail(this.userid, this.page, this.pageSize, '')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.merchantList = res.data.content;
          res.data.content.map((merchant: any) => {
            merchantdetailsList.push({
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
          this.loader = false;
          this.dropdownList = merchantdetailsList;
        },
      });
  }

  getitemlist() {
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
      },
    });
  }

  orderRefreshForm() {
    this.orderForm = this.formBuilder.group({
      id: [null],
      userId: [this.userid, [Validators.required]],
      orderDate: [this.currentdate, [Validators.required]],
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
    this.orderForm.controls['orderDetails'].setValue(this.slubdata().value);
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
        this.slubdata().value.concat(this.deletedData)
      );
      this.orderService
        .updateOrder(this.orderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.successmsg(res.message);
              this.orderRefreshForm();
              this.showAddBtn = true;
            } else {
              this.errorssmsg(res.message);
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
              this.successmsg(res.message);
              this.orderRefreshForm();
              this.showAddBtn = false;
            } else {
              this.errorssmsg(res.message);
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

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  get f() {
    return this.orderForm.controls;
  }

  get sf() {
    return this.searchForm.controls;
  }

  slubdata(): FormArray {
    return this.slubform.get('slubformval') as FormArray;
  }

  setnameforstakeholder(event: any, index: any) {
    let f = this.merchantList.filter((x: any) => x.id == event);
    this.slubdata().controls[index].patchValue({
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
    this.slubdata().controls[i].patchValue({
      itemId: item.id,
    });
  }

  onInitiatorItemUnSelect1(item: any, i: any) {
    this.slubdata().controls[i].patchValue({
      itemId: '',
    });
  }

  searchRefreshForm() {
    this.searchForm = this.formBuilder.group({
      fromdate: [''],
      todate: [''],
    });
    this.getAllOrderList();
  }

  getAllOrderList() {
    this.orderService
      .getAllOrder(
        this.page,
        this.pageSize,
        this.sf['fromdate'].value,
        this.sf['todate'].value,
        this.userid
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.orderList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.merchantList.length;
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

  toggleAddOrderBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  slabrefreshform(): FormGroup {
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

  getMercahntName(id: string): string {
    let d = this.merchantList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].name;
    }
    return '';
  }

  editOrder(data: any) {
    this.slubdata().clear();

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

  setOrderNameinUI(data: any, i: any) {
    this.selectedItems1[i] = this.dropdownList1.filter(
      (x: any) => x.id == data.itemId
    );
  }

  getOrderDetail(date: string, orderId: string) {
    this.loader = true;
    this.orderService
      .getAllOrderDetail(date, date, this.userid, orderId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            let data = res.data;
            let i = 0;
            data.map((value: any) => {
              this.setOrderNameinUI(value, i);
              this.slubdata().push(
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

  getMercahntMobile(id: string): string {
    let d = this.merchantList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].phoneNumber;
    }
    return '';
  }

  addSlub() {
    let arr = this.slubdata().value;
    if (arr.length > 0 && this.slubdata().invalid) {
      this.slubadderrorshow = true;
      return;
    }

    this.slubdata().push(this.slabrefreshform());
    this.slubadderrorshow = false;
  }

  deleteslub(i: number) {
    let items = this.slubdata().value;
    let j = 0;

    items.map((item: any) => {
      if (i == j && item.id) {
        item.deleted = true;
        this.deletedData.push(item);
      } else {
        j++;
      }
    });
    this.slubdata().removeAt(i);
    this.selectedItems1[i] = [];
  }

  autoAddSlab() {
    this.slubdata().clear();
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
    this.getAllmerchant();
    return event;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
