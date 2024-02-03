import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../common/loader/loader.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MerchantService } from 'src/app/core/service/merchant.service';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from 'src/app/core/service/role.service';
import Swal from 'sweetalert2';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import {
  NgbDropdownModule,
  NgbModal,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pendingorder',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbDropdownModule,
  ],
  templateUrl: './pendingorder.component.html',
  styleUrls: ['./pendingorder.component.scss'],
})
export class PendingorderComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  merchantOrderService = inject(MerchantService);
  formBuilder = inject(FormBuilder);
  roleService = inject(RoleService);
  merchantService = inject(MerchantService);
  encryptionService = inject(EncryptionService);
  configservice = inject(ConfigurationService);
  modalService = inject(NgbModal);
  loader: boolean = false;
  searchForm!: FormGroup;
  pendingOrderList: any = [];
  existingUserList: any = [];
  dropdownList1: any = [];
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  roleid: string = '';
  userid: string = '';
  merchantList: any = [];
  modalData: any;
  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  ngOnInit(): void {
    this.getAllmerchant();
    this.getAllusers();
    this.getallZone();
    this.roleid = this.encryptionService.decrypt(localStorage.getItem('role')!);
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    this.searchFormRefresh();
    this.getallorder();
  }

  searchFormRefresh() {
    this.searchForm = this.formBuilder.group({
      fromDate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`],
      pickUp: ['pickup'],
      delivery: [''],
    });
  }

  get sf() {
    return this.searchForm.controls;
  }

  search() {
    this.getallorder();
  }

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }

  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  async getRemarks(data: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Multiple inputs',
      html: `
      <label for="swal-input1"> Collection Amount </label>
      <input type="number" id="swal-input1" class="swal2-input" value=${
        data.collectionAmount
      } />
      <label for="paymentInfo"> Payment Info </label>
        <select
          formControlName="paymentInfo"
          id="paymentInfo"
          class="form-select"
          value=${data.paymentInfo}
        >
        ${this.getSelectOptions(data.paymentInfo)}
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('paymentInfo') as HTMLInputElement).value,
        ];
      },
    });
    if (formValues) {
      return JSON.stringify(formValues);
    }
    return;
  }

  async deliveryOrder(data: any) {
    let riderData = JSON.parse((await this.getRemarks(data))!);
    data.collectionAmount = riderData[0];
    data.paymentInfo = riderData[1];

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
              this.getallorder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
  }

  getSelectOptions(selectedValue: string) {
    const options = ['Cash On Delivery', 'Full Paid', 'Delivery Cost Only'];
    return options
      .map((option) => {
        return `<option value="${option}" ${
          option === selectedValue ? 'selected' : ''
        }>${option}</option>`;
      })
      .join('');
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
              this.getallorder();
              window.scrollTo(0, 0);
              this.loader = false;
            },
          });
        }
      });
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
  getallorder() {
    let a = '',
      b = '';
    if (this.sf['pickUp'].value == 'pickup') {
      a = this.userid;
    } else {
      b = this.userid;
    }
    this.merchantOrderService
      .getOrder(
        0,
        1000,
        '',
        '',
        this.sf['fromDate'].value,
        this.sf['toDate'].value,
        '',
        a,
        b
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess || res.statusCode == 200) {
            this.pendingOrderList = res.data.content;
            this.total = res.data.totalElements;
            if (this.toPageVal > this.total) {
              this.toPageVal = this.total;
            } else {
              this.toPageVal = this.pendingOrderList.length;
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
  getMerchantInformation(id: any) {
    let user = this.existingUserList.filter((m: any) => m.id == id);

    if (user.length > 0) {
      let merchant = this.merchantList.filter(
        (m: any) => m.phoneNumber == user[0].mobile
      );
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
    }
    else{
      return "";
    }
  }

  filterArea(m: any) {
    return this.dropdownList1.filter((x: any) => x.id == m.area)[0][
      'customtext'
    ];
  }
  getAllusers() {
    let data: any = [];
    this.roleService
      .getAllusers(0, 1000)
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

  getZoneName(st: any) {
    let a: any = this.dropdownList1.filter((x: any) => x.id === st);
    if (a.length > 0) {
      return a[0].customtext;
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
  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getallorder();
    return event;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
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
