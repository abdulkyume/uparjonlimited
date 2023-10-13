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
import { Subject } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

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

  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formbuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private merchantService: MerchantService
  ) {}

  ngOnInit(): void {
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
  }

  placeOrderFormRefresh() {
    this.placeOrderForm = this.formbuilder.group({
      pickupArea: ['', [Validators.required]],
      pickupAddress: ['', [Validators.required]],
      pickupdate: [`${this.currentdate}`, [Validators.required]],
      deliverydate: [`${this.currentdate}`, [Validators.required]],
      pickuptime: ['flexible', [Validators.required]],
      deliverytime: ['flexible', [Validators.required]],
      item: ['', [Validators.required]],
      service: ['', [Validators.required]],
      charge: ['', [Validators.required]],
      packageCount: [0, [Validators.required]],
      weight: ['', [Validators.required]],
      collectionAmount: ['', [Validators.required]],
      deliveryCost: ['', [Validators.required]],
      paymentInfo: ['Cash On Delivery', [Validators.required]],
      productCost: ['', [Validators.required]],
      customerName: ['', [Validators.required]],
      customerNumber: ['', [Validators.required]],
      customerAltNumber: [''],
      customerAddress: ['', [Validators.required]],
      customerArea: ['', [Validators.required]],
      deliveryStatus: [''],
    });
  }

  onSearch() {}

  onSubmit() {}

  toggleBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    // this.getAllmerchant();
    return event;
  }

  orderSformRefresh() {
    this.orderSform = this.formbuilder.group({
      fromDate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }

  onInitiatorItemSelect(item: any) {
    this.serviceList = this.getServiceInfoByItem(item);
  }

  onInitiatorItemUnSelect(item: any) {
    this.dropdownList = [];
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
}
