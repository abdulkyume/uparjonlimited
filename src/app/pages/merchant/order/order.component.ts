import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import {
  NgbDropdownModule,
  NgbModal,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import Swal from 'sweetalert2';
import { RoleService } from 'src/app/core/service/role.service';
import * as XLSX from 'xlsx';

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
    NgbDropdownModule,
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit, OnDestroy {
  @ViewChild('reporttable') table!: ElementRef;
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  totalOrder: number = 0;
  totalPOrder: number = 0;
  totalCOrder: number = 0;
  totalCnOrder: number = 0;
  page: number = 0;
  private dataLoaded: boolean = false;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  orderSform!: FormGroup;
  placeOrderForm!: FormGroup;
  showAddBtn: boolean = true;
  uniqueItemsLista: any = [];
  serviceList: any = [];
  modalService = inject(NgbModal);
  deliveryCost: number = 0;
  orderList: any = [];
  existingUserList: any = [];
  roleid: string = '';
  userId: string = '';
  userRoleid: string = '';
  merchantList: any = [];

  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;

  dropdownList1 = [];
  selectedItems1: any;

  dropdownList2 = [];
  selectedItems2: any;

  dropdownList3 = [];
  selectedItems3: any;
  selectedItems4: any;

  modalData: any;

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formbuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private roleService: RoleService,
    private merchantService: MerchantService,
    private configservice: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.orderSformRefresh();
    this.getAllmerchant();
    this.roleid = this.encryptionService.decrypt(localStorage.getItem('role')!);
    this.userRoleid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).roleId;
    this.userId = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    this.getAllmerchantonly();
    this.getAllusers();
    this.getallZone();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
    this.placeOrderFormRefresh();
    this.sericecharge();
    this.getAllOrder();
  }

  downloadXl() {
    this.loader = true;
    if (this.userRoleid == '1143fcc9-02d1-4bd0-ab47-b5efc92072fc') {
      this.merchantService
        .getOrder(
          this.page,
          1000,
          this.sfc['orderNo'].value,
          this.sfc['status'].value,
          this.sfc['fromDate'].value,
          this.sfc['toDate'].value
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess || res.statusCode == 200) {
              this.orderList = res.data.content;
              this.total = res.data.totalElements;
              if (this.toPageVal > this.total) {
                this.toPageVal = this.total;
              } else {
                this.toPageVal = this.orderList.length;
              }
              this.dataLoaded = true;
            }
          },

          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            setTimeout(() => {
              this.generateAndDownloadExcel();
            }, 5000);
            setTimeout(() => {
              this.getAllOrder();
            }, 7000);
          },
        });
    } else {
      this.merchantService
        .getOrder(
          this.page,
          1000,
          this.sfc['orderNo'].value,
          this.sfc['status'].value,
          this.sfc['fromDate'].value,
          this.sfc['toDate'].value,
          this.userId
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess || res.statusCode == 200) {
              this.orderList = res.data.content;
              this.total = res.data.totalElements;
              if (this.toPageVal > this.total) {
                this.toPageVal = this.total;
              } else {
                this.toPageVal = this.orderList.length;
              }
              this.dataLoaded = true;
            }
          },

          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            setTimeout(() => {
              this.generateAndDownloadExcel();
            }, 5000);
            setTimeout(() => {
              this.getAllOrder();
            }, 7000);
          },
        });
    }
  }

  private generateAndDownloadExcel() {
    if (this.dataLoaded) {
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
        this.table.nativeElement
      );

      let rr = parseInt(ws['!ref']!.split(':')[1].replace(/[^\d]/g, ''));
      // Remove the column from each row
      for (let i = 1; i <= rr; i++) {
        delete ws[`A${i}`];
      }

      // Create a new workbook and append the modified sheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'my-sheet');

      // Save the workbook to a file
      const fileName = 'Merchant_Order.xlsx';
      XLSX.writeFile(wb, fileName);
    }
  }

  getAllmerchant() {
    this.merchantService
      .getMerchantDetail('', 0, 1000, '')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.merchantList = res.data.content;
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {},
      });
  }

  getMerchantInformation(id: any) {
    let user = this.existingUserList.filter((m: any) => m.id == id);
    let merchant = this.merchantList.filter(
      (m: any) => m.phoneNumber == user[0].mobile
    );
    if (user.length > 0 && merchant.length > 0) {
      return (
        merchant[0].name +
        '<br/><br/>' +
        merchant[0].phoneNumber +
        '/' +
        merchant[0].altPhoneNumber +
        '<br/><br/>' +
        merchant[0].house +
        ', ' +
        merchant[0].road +
        '<br/><br/>' +
        this.filterArea(merchant[0]) +
        ', ' +
        merchant[0].district
      );
    } else {
      return '';
    }
  }

  filterArea(m: any) {
    return this.dropdownList1.filter((x: any) => x.id == m.area)[0][
      'customtext'
    ];
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
      weight: [''],
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
      deleted: [false],
      mercahntId: [`${this.userId}`],
    });
  }

  onSearch() {
    this.getAllOrder();
  }

  editOrder(data: any) {
    this.selectedItems = this.dropdownList.filter(
      (item: any) => item === data.item
    );
    this.selectedItems1 = this.dropdownList1.filter(
      (item: any) => item.id === data.customerArea
    );

    this.selectedItems3 = this.dropdownList3.filter(
      (item: any) => item.id === data.pickUpAssigned
    );

    this.selectedItems4 = this.dropdownList3.filter(
      (item: any) => item.id === data.deliveryAssigned
    );
    this.serviceList = this.getServiceInfoByItem(data.item);
    this.f['id'].setValue(data.id);
    this.f['pickupDate'].setValue(data.pickupDate);
    this.f['deliverydate'].setValue(data.deliverydate);
    this.f['pickuptime'].setValue(data.pickuptime);
    this.f['deliverytime'].setValue(data.deliverytime);
    this.f['item'].setValue(data.item);
    this.f['service'].setValue(data.service);
    this.f['packageCount'].setValue(data.packageCount);
    this.f['weight'].setValue(data.weight);
    this.f['collectionAmount'].setValue(data.collectionAmount);
    this.f['deliveryCost'].setValue(data.deliveryCost);
    this.f['paymentInfo'].setValue(data.paymentInfo);
    this.f['productCost'].setValue(data.productCost);
    this.f['customerName'].setValue(data.customerName);
    this.f['customerNumber'].setValue(data.customerNumber);
    this.f['customerAltNumber'].setValue(data.customerAltNumber);
    this.f['customerAddress'].setValue(data.customerAddress);
    this.f['customerArea'].setValue(data.customerArea);
    this.f['deliveryStatus'].setValue(data.deliveryStatus);
    this.f['pickUpAssigned'].setValue(data.pickUpAssigned);
    this.f['deliveryAssigned'].setValue(data.deliveryAssigned);
    this.f['active'].setValue(data.active);
    this.f['deleted'].setValue(data.deleted);
    this.f['mercahntId'].setValue(data.mercahntId);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteOrder(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'Do you want to Delete!',
        icon: 'warning',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.loader = true;

          data.deleted = true;
          this.merchantService.updateOrder(data).subscribe({
            next: (res: any) => {
              if (res.isSuccess || res.statusCode == 200) {
                this.successmsg(res.message);
              } else {
                this.errorssmsg(res.message);
              }
            },
            error: (err: any) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => {
              this.getAllOrder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
  }

  pickOrder(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'Do you want to Update!',
        icon: 'warning',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.loader = true;

          data.deliveryStatus = 'PICKEDUP';
          this.merchantService.updateOrder(data).subscribe({
            next: (res: any) => {
              if (res.isSuccess || res.statusCode == 200) {
                this.successmsg(res.message);
              } else {
                this.errorssmsg(res.message);
              }
            },
            error: (err: any) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => {
              this.getAllOrder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
  }

  deliveryOrder(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'Do you want to Update!',
        icon: 'warning',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.loader = true;

          data.deliveryStatus = 'DELIVERED';
          this.merchantService.updateOrder(data).subscribe({
            next: (res: any) => {
              if (res.isSuccess || res.statusCode == 200) {
                this.successmsg(res.message);
              } else {
                this.errorssmsg(res.message);
              }
            },
            error: (err: any) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => {
              this.getAllOrder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
  }

  approveOrder(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'Do you want to Approve!',
        icon: 'warning',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.loader = true;
          data.deliveryStatus = 'APPROVED';
          this.merchantService.updateOrder(data).subscribe({
            next: (res: any) => {
              if (res.isSuccess || res.statusCode == 200) {
                this.successmsg(res.message);
              } else {
                this.errorssmsg(res.message);
              }
            },
            error: (err: any) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => {
              this.getAllOrder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
  }

  cancelOrder(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'Do you want to Cancel!',
        icon: 'warning',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.loader = true;
          data.deliveryStatus = 'CANCELLED';
          this.merchantService.updateOrder(data).subscribe({
            next: (res: any) => {
              if (res.isSuccess || res.statusCode == 200) {
                this.successmsg(res.message);
              } else {
                this.errorssmsg(res.message);
              }
            },
            error: (err: any) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => {
              this.getAllOrder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
  }

  getRider(id: string): string {
    let d = this.existingUserList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].firstName + ' ' + d[0].lastName + ' <br/><br/>' + d[0].mobile;
    }
    return '';
  }

  getAllusers() {
    let data: any = [];
    this.roleService
      .getAllusers(0, 1000, '', '44eff443-bf52-4e6f-a5d5-d42fb409e0c1')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          res.data.content.map((content: any) => {
            data.push({
              id: content.id,
              customtext: `${content.firstName} ${content.lastName} - ${content.mobile}`,
            });
          });
        },
        error: (err) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.dropdownList3 = data;
        },
      });
  }

  getAllmerchantonly() {
    this.roleService
      .getAllusers(0, 1000, '', '')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.existingUserList = res.data.content;
        },
        error: (err) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {},
      });
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
      this.merchantService
        .updateOrder(this.placeOrderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess || res.statusCode == 200) {
              this.showAddBtn = true;
              this.placeOrderFormRefresh();
              this.successmsg(res.message);
            } else {
              this.errorssmsg(res.message);
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.getAllOrder();
          },
        });
    } else {
      this.merchantService
        .addOrder(this.placeOrderForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess || res.statusCode == 201) {
              this.showAddBtn = true;
              this.placeOrderFormRefresh();
              this.successmsg(res.message);
            } else {
              this.errorssmsg(res.message);
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.getAllOrder();
          },
        });
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
      orderNo: [''],
      status: ['PENDING'],
      fromDate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
    });
  }

  get sfc() {
    return this.orderSform.controls;
  }

  getAllOrder() {
    this.loader = true;
    if (this.userRoleid == '1143fcc9-02d1-4bd0-ab47-b5efc92072fc') {
      this.merchantService
        .getOrder(
          this.page,
          this.pageSize,
          this.sfc['orderNo'].value,
          this.sfc['status'].value,
          this.sfc['fromDate'].value,
          this.sfc['toDate'].value
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
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
          },
          complete: () => {
            this.loader = false;
          },
        });
    } else {
      this.merchantService
        .getOrder(
          this.page,
          this.pageSize,
          this.sfc['orderNo'].value,
          this.sfc['status'].value,
          this.sfc['fromDate'].value,
          this.sfc['toDate'].value,
          this.userId
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
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
          },
          complete: () => {
            this.loader = false;
          },
        });
    }
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
    this.f['item'].setValue(item);
    this.serviceList = this.getServiceInfoByItem(item);
  }

  onInitiatorItemUnSelect(item: any) {
    this.f['item'].setValue('');
  }

  onInitiatorItemSelect1(item: any) {
    this.placeOrderForm.controls['customerArea'].setValue(item.id);
  }

  onInitiatorItemUnSelect1(item: any) {
    this.placeOrderForm.controls['customerArea'].setValue('');
  }
  onInitiatorItemSelect3(item: any) {
    this.placeOrderForm.controls['pickUpAssigned'].setValue(item.id);
  }

  onInitiatorItemUnSelect3(item: any) {
    this.placeOrderForm.controls['pickUpAssigned'].setValue('');
  }

  onInitiatorItemSelect4(item: any) {
    this.placeOrderForm.controls['deliveryAssigned'].setValue(item.id);
  }

  onInitiatorItemUnSelect4(item: any) {
    this.placeOrderForm.controls['deliveryAssigned'].setValue('');
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
    } else {
      this.f['deliveryCost'].setValue(0);
      this.f['deliveryCost'].setValue(this.deliveryCost);
    }
  }

  updateCollectionCost() {
    this.f['collectionAmount'].setValue(
      this.f['deliveryCost'].value + this.f['productCost'].value
    );
  }

  serviceChargeData = [
    {
      serviceName: 'Bike Delivery: 2-6 hr',
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
      serviceName: 'Bike Delivery 1-3 hr',
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
      serviceName: 'Bike Delivery 1-2 hr',
      items: {
        list: [
          'Frozen Food',
          'Cooked Items',
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
      serviceName: 'Bike Delivery 1-2 hr',
      items: {
        list: ['Cup Cake'],
      },
      cost: 250,
    },
    {
      serviceName: 'AC Car / Freezing Van (Flexible Time): 2-6 hr',
      items: {
        list: [
          'Birthday Cake',
          'Cooked Items',
          'Frozen Items',
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
      serviceName: 'AC Car / Freezing Van (Urgent Delivery): 1-2 hr',
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
          'Lunch Items',
          'Cooked Items',
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

  openModal(content: any, data: any) {
    this.modalData = data;
    this.modalService.open(content, {
      size: 'xl',
      backdrop: 'static',
      centered: true,
      scrollable: true,
    });
  }
}
