import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchantService } from 'src/app/core/service/merchant.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, catchError, take, takeUntil } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    NgbPaginationModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    NgbDropdownModule
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  totalOrder: number = 0;
  totalPOrder: number = 0;
  totalCOrder: number = 0;
  totalCnOrder: number = 0;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  orderSform!: FormGroup;
  placeOrderForm!: FormGroup;
  showAddBtn: boolean = true;
  uniqueItemsLista: any = [];
  serviceList: any = [];
  deliveryCost: number = 0;
  orderList: any = [];

  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;

  dropdownList1 = [];
  selectedItems1: any;

  dropdownList2 = [];
  selectedItems2: any;

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formbuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private merchantService: MerchantService,
    private configservice: ConfigurationService
  ) { }

  ngOnInit(): void {

    this.getallZone();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
    this.orderSformRefresh();
    this.placeOrderFormRefresh();
    this.sericecharge();
    this.getAllOrder();
  }

  placeOrderFormRefresh() {
    this.placeOrderForm = this.formbuilder.group({
      id: [null],
      pickupDate: [`${this.currentdate}`],
      deliverydate: [`${this.currentdate}`],
      pickuptime: ['flexible'],
      deliverytime: ['flexible'],
      item: ['', [Validators.required]],
      service: ['', [Validators.required]],
      packageCount: [0],
      weight: ['', [Validators.required]],
      collectionAmount: ['', [Validators.required]],
      deliveryCost: ['', [Validators.required]],
      paymentInfo: ['Cash On Delivery'],
      productCost: ['', [Validators.required]],
      customerName: ['', [Validators.required]],
      customerNumber: ['', [Validators.required]],
      customerAltNumber: [''],
      customerAddress: ['', [Validators.required]],
      customerArea: ['', [Validators.required]],
      deliveryStatus: ['PENDING'],
      pickUpAssigned: [''],
      deliveryAssigned: [''],
      active: [true],
      deleted: [false]
    });
  }

  onSearch() {
    this.getAllOrder();
  }

  editOrder(data: any) {
    console.log(data);
  }
  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }
  onSubmit() {
    if (this.placeOrderForm.invalid) {
      return;
    }
    if (this.f['id'].value) {
      this.merchantService.updateOrder(this.placeOrderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess || res.statusCode == 200) {
              this.showAddBtn = true;
              this.placeOrderFormRefresh();
              this.successmsg(res.message);
            }
            else {
              this.errorssmsg(res.message)
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false
          },
          complete: () => {
            this.getAllOrder();
          }
        })
    }
    else {
      this.merchantService.addOrder(this.placeOrderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            console.log(res);
            if (res.isSuccess || res.statusCode == 201) {
              this.showAddBtn = true;
              this.placeOrderFormRefresh();
              this.successmsg(res.message);
            }
            else {
              this.errorssmsg(res.message)
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false
          },
          complete: () => {
            this.getAllOrder();
          }
        })
    }
  }

  toggleBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  getallZone() {
    let list: any = [];
    this.configservice
      .getAllZone(0, 2000, '')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          res.data.content.map((content: any) => {
            list.push({ id: content.id, customtext: content.name });
          });
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.dropdownList1 = list;
        },
      });
  }

  orderSformRefresh() {
    this.orderSform = this.formbuilder.group({
      id: [''],
      status: ['PENDING'],
      fromDate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
    });
  }

  get sfc() {
    return this.orderSform.controls;
  }

  getAllOrder() {
    this.merchantService.getOrder(this.page, this.pageSize, this.sfc['id'].value, this.sfc['status'].value, this.sfc['fromDate'].value, this.sfc['toDate'].value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          console.log(res.data.content)
          if (res.isSuccess || res.statusCode == 200) {
            this.orderList = res.data.content;
            this.total = res.data.totalElements;
            if (this.toPageVal > this.total) {
              this.toPageVal = this.total;
            } else {
              this.toPageVal = this.orderList.length;
            }
          }
        },

        error: (err: any) => {
          console.error(err);
          this.loader = false;
        }
      })
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllOrder();
    return event;
  }



  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }

  onInitiatorItemSelect(item: any) {
    this.f['item'].setValue(item)
    this.serviceList = this.getServiceInfoByItem(item);
  }

  onInitiatorItemUnSelect(item: any) {
    this.dropdownList = [];
  }

  onInitiatorItemSelect1(item: any) {
    this.placeOrderForm.controls['customerArea'].setValue(item.id);
  }

  onInitiatorItemUnSelect1(item: any) {
    this.placeOrderForm.controls[''].setValue(item.id);
  }

  get f() {
    return this.placeOrderForm.controls;
  }

  servicechargef() {
    let a = this.serviceChargeData.filter(
      (x: any) => x.serviceName == this.f['service'].value
    );
    this.f['deliveryCost'].setValue(a[0].cost);
    this.deliveryCost = this.f['deliveryCost'].value;
  }

  addPackageCost() {
    if (this.f['packageCount'].value > 0) {
      this.f['deliveryCost'].setValue(0);
      this.f['deliveryCost'].setValue(
        this.deliveryCost + this.f['packageCount'].value * 100
      );
    }
  }

  updateCollectionCost() {
    this.f['collectionAmount'].setValue(
      this.f['deliveryCost'].value + this.f['productCost'].value
    );
  }

  serviceChargeData = [
    {
      serviceName: 'Standard Service (Bike Delivery: 2-6 hr)',
      items: {
        list: [
          'Book',
          'Medicine',
          'Documents',
          'Jewellery',
          'Cosmetics',
          'Dresses',
          'Pet Care',
          'Other Ecommerce Products',
        ],
      },
      cost: 100,
    },
    {
      serviceName: 'Express Service (Bike Delivery 1-3 hr)',
      items: {
        list: [
          'Dry Food',
          'Brownie',
          'Jar Cake',
          'Chocolate',
          'Cookies',
          'Bread',
          'Fruits',
          'Grocery',
          'Beverage',
          'Tree',
        ],
      },
      cost: 150,
    },
    {
      serviceName: 'Express Service (Bike Delivery 1-2 hr)',
      items: {
        list: [
          'Frozen Food',
          'Cooked Food',
          'Lunch Items',
          'Tub Cake',
          'Slice Cake',
          'Yoghurt',
          'Dessert',
          'Sweet',
          'Milk Items',
        ],
      },
      cost: 200,
    },
    {
      serviceName: 'Express Service (Bike Delivery 1-2 hr)',
      items: {
        list: ['Birthday Cake', 'Cup Cake'],
      },
      cost: 250,
    },
    {
      serviceName:
        'Super Express Service (AC Car / Freezing Van: Flexible Time) 2-6 hr',
      items: {
        list: [
          'Birthday Cake',
          'Cooked Items',
          'Frozen Itmes',
          'Ice Cream',
          'Fragile',
          'Liquid',
          'Surprised Gift',
          'Others',
        ],
      },
      cost: 250,
    },
    {
      serviceName:
        'Super Express Service (AC Car / Freezing Van: Urgent Delivery): 1-2 hr',
      items: {
        list: [
          'Birthday Cake',
          'Urgent Food Delivery',
          'Bulk Food Delivery',
          'Electronic Items',
          'Others',
        ],
      },
      cost: 600,
    },
    {
      serviceName: 'Super Express Service (CNG) 1-2 hr',
      items: {
        list: [
          'Birthday Cake',
          'Urgent Food Delivery',
          'Bulk Food Delivery',
          'Fragile',
          'Gift',
          'Others',
        ],
      },
      cost: 400,
    },
  ];

  sericecharge() {
    const uniqueItemsSet = new Set();
    this.serviceChargeData.forEach((service) => {
      const items = service.items.list;
      items.forEach((item) => {
        uniqueItemsSet.add(item);
      });
    });
    const uniqueItemsList = Array.from(uniqueItemsSet);
    this.uniqueItemsLista = uniqueItemsList;
    this.dropdownList = this.uniqueItemsLista;
  }

  getServiceInfoByItem(selectedItem: string) {
    const result: any = [];

    this.serviceChargeData.forEach((service) => {
      const serviceName = service.serviceName;
      const charge = service.cost;
      const items = service.items.list;

      if (items.includes(selectedItem)) {
        result.push({ serviceName, charge });
      }
    });
    return result;
  }

  // getAllZone() {
  //   let allzone: any = [];
  //   this.configservice
  //     .getAllZone(
  //       0,
  //       2000,
  //       ""
  //     )
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe({
  //       next: (res: any) => {
  //         res.data.content.map((content: any) => {
  //           allzone.push({ id: content.id, customtext: content.name });
  //         });
  //       },
  //       error: (err: any) => {
  //         console.error(err);
  //         this.loader = false;
  //       },
  //       complete: () => {
  //         this.dropdownList2 = allzone;
  //         console.log(this.dropdownList2)
  //       },
  //     });
  // }

  getZoneName(st: any) {
    let a: any = this.dropdownList1.filter((x: any) => x.id === st);
    if (a.length > 0) {
      return a[0].customtext;
    }
    return '';
  }
}
