import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  selectedItems1: any = [];
  existingUserList: any = [];

  userid: string = '';
  page: number = 0;
  pageSize: number = 500;
  cPageVal: number = 1;
  toPageVal!: number;
  total!: number;

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
  ) { }

  ngOnInit(): void {
    this.getAllusers();
    this.reprotFormRefresh();
    this.getAllmerchant();
    this.getitemlist();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
  }

  getAllusers() {
    let ilist: any[] = [];
    this.roleService
      .getAllusers(0, 500)
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
          this.dropdownList1 = ilist;
        },
      });
  }

  reprotFormRefresh() {
    this.reprotForm = this.formbuilder.group({
      merchantId: [''],
      riderId: [''],
      fromdate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
    });
    this.getExpense();
  }

  getMercahntName(id: string): string {
    let d = this.merchantList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].name;
    }
    return '';
  }

  getRider(id: string): string {
    let d = this.existingUserList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].firstName + ' ' + d[0].lastName + ' - ' + d[0].mobile;
    }
    return '';
  }

  getMercahntMobile(id: string): string {
    let d = this.merchantList.filter((m: any) => m.id === id);
    if (d.length > 0) {
      return d[0].phoneNumber;
    }
    return '';
  }

  downloadxl() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    );

    /* new format */
    var fmt = '0.00';
    /* change cell format of range B2:D4 */
    var range = { s: { r: 1, c: 1 }, e: { r: 2, c: 100000 } };
    for (var R = range.s.r; R <= range.e.r; ++R) {
      for (var C = range.s.c; C <= range.e.c; ++C) {
        var cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (!cell || cell.t != 'n') continue; // only format numeric cells
        cell.z = fmt;
      }
    }
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'hisab');
    var fmt = '@';
    wb.Sheets['hisab']['F'] = fmt;
    const newWorksheet = XLSX.utils.aoa_to_sheet([
      ['Expense', 'Profit'],
      [this.totalExpense, this.totalProfit],
    ]);

    // Add the new worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, newWorksheet, 'profit');

    /* save to file */
    XLSX.writeFile(wb, 'Daily-Hisab.xlsx');
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
        this.f['merchantId'].value,
        this.f['riderId'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.orderList = res.data.content;
          this.total = res.data.totalElements!;
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
              this.totalReceivedAmount + +x.receivedAmount;
            this.totalDeliveryCost = this.totalDeliveryCost + +x.deliveryCost;
            this.totalPayable =
              this.totalReceivedAmount - this.totalDeliveryCost;
            this.totalProfit = this.totalDeliveryCost - this.totalExpense;
          });
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
      complete: () => { },
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
    this.f['riderId'].setValue(item.id);
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
