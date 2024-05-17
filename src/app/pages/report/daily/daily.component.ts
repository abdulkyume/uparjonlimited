import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from 'src/app/core/service/order.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import { MerchantService } from 'src/app/core/service/merchant.service';
import { ReportService } from 'src/app/core/service/report.service';
import { RoleService } from 'src/app/core/service/role.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-daily',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.scss'],
})
export class DailyComponent implements OnInit, OnDestroy {
  @ViewChild('reporttable') table!: ElementRef;
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  totalOrder: number = 0;
  totalReceivedAmount: number = 0;
  totalDeliveryCost: number = 0;
  totalPayable: number = 0;
  totalExpense: number = 0;
  totalProfit: number = 0;

  orderList: any;
  merchantList: any = [];
  itemList: any;

  dropdownSettings = {};
  dropdownList = [];
  selectedItems = [];
  dropdownList1: any;
  dropdownList2: any;
  selectedItems1: any = [];
  selectedItems2: any = [];
  existingUserList: any = [];
  existingUserListm: any = [];

  userid: string = '';
  page: number = 0;
  pageSize: number = 500;
  cPageVal: number = 1;
  toPageVal!: number;
  total!: number;
  role: string = '';
  user: any;
  merchant: any;

  reprotForm!: FormGroup;

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formbuilder: FormBuilder,
    private orderService: ReportService,
    private orderService1: OrderService,
    private encryptionService: EncryptionService,
    private configService: ConfigurationService,
    private merchantService: MerchantService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.role = this.encryptionService.decrypt(localStorage.getItem('role')!);
    this.user = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    );
    if (localStorage.getItem('currentMerchant')) {
      this.merchant = JSON.parse(
        this.encryptionService.decrypt(localStorage.getItem('currentMerchant')!)
      );
    }
    this.getAllmerchant();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
    this.reprotFormRefresh();
  }

  getAllusers1() {
    let ilist: any[] = [];
    this.roleService
      .getAllusers(0, 1000, '', '44eff443-bf52-4e6f-a5d5-d42fb409e0c1')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.existingUserList = res.data.content;
          res.data.content.map((x: any) => {
            ilist.push({
              id: x.id,
              customtext: `${x.firstName} ${x.lastName}-${x.mobile}`,
            });
          });
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.dropdownList2 = ilist;
          this.getAllusers2();
        },
      });
  }

  getAllusers2() {
    let ilist: any[] = [];
    this.roleService
      .getAllusers(0, 1000, '', 'e4241052-bf66-497b-9c4e-ee439cc586d4')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.existingUserListm = res.data.content;
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {},
      });
  }

  clear() {
    this.reprotForm = this.formbuilder.group({
      merchantId: [''],
      riderId: [''],
      fromdate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
    });
    this.selectedItems1 = [];
    this.selectedItems2 = [];
  }

  reprotFormRefresh() {
    this.reprotForm = this.formbuilder.group({
      merchantId: [
        this.role === '1143fcc9-02d1-4bd0-ab47-b5efc92072fc'
          ? ''
          : this.merchant.id,
      ],
      riderId: [''],
      fromdate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
    });
    this.getExpense();
  }

  getExpense() {
    this.loader = true;
    this.orderService
      .getExpense(this.f['fromdate'].value, this.f['toDate'].value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.totalExpense = res.data[0].totalcost;
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.getAllOrderList();
        },
      });
  }

  getAllOrderList() {
    this.totalReceivedAmount = 0;
    this.totalDeliveryCost = 0;
    this.totalPayable = 0;
    this.totalProfit = 0;
    this.orderService
      .getAllOrderReport(
        this.page,
        this.pageSize,
        this.f['fromdate'].value,
        this.f['toDate'].value,
        this.f['riderId'].value,
        this.f['merchantId'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.orderList = res.data;
          this.total = this.orderList.length;
          this.totalOrder = this.total;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.orderList.length;
          }
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.orderList.map((x: any) => {
            this.totalReceivedAmount =
              this.totalReceivedAmount + +x.received_amount;
            this.totalDeliveryCost = this.totalDeliveryCost + +x.deliverycost;
            this.totalPayable =
              this.totalReceivedAmount - this.totalDeliveryCost;
            this.totalProfit = this.totalDeliveryCost - this.totalExpense;
          });
          this.loader = false;
        },
      });
  }

  downloadGetAllOrderList() {
    this.loader = true;
    this.totalReceivedAmount = 0;
    this.totalDeliveryCost = 0;
    this.totalPayable = 0;
    this.totalProfit = 0;
    this.orderService
      .downloadGetAllOrderReport(
        this.page,
        this.pageSize,
        this.f['fromdate'].value,
        this.f['toDate'].value,
        this.f['riderId'].value,
        this.f['merchantId'].value,
        true
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          saveAs(res.body, 'Daily Report.xlsx');
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

  getOrderDetail(date: string, userid: string, orderId: string) {
    this.loader = true;
    this.orderService1
      .getAllOrderDetail(date, date, this.userid, orderId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            let data = res.data;
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

  getAllmerchant() {
    let merchantdetailsList: any = [];
    this.merchantService
      .getMerchantDetail('', this.page, this.pageSize, '')
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
          this.dropdownList = merchantdetailsList;
          this.loader = false;
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
      complete: () => {},
    });
  }

  get f() {
    return this.reprotForm.controls;
  }

  onInitiatorItemSelect(item: any) {
    this.f['merchantId'].setValue(item.id);
  }

  onInitiatorItemUnSelect(item: any) {
    this.f['merchantId'].setValue('');
  }

  onInitiatorItemSelect1(item: any) {
    this.f['riderId'].setValue(item.id);
  }

  onInitiatorItemUnSelect1(item: any) {
    this.f['riderId'].setValue('');
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllOrderList();
    return event;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
