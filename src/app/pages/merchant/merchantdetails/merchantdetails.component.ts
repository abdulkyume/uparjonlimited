import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, map } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { MerchantService } from 'src/app/core/service/merchant.service';
import Swal from 'sweetalert2';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { DataService } from 'src/app/core/service/data.service';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-merchantdetails',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbDropdownModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './merchantdetails.component.html',
  styleUrls: ['./merchantdetails.component.scss'],
})
export class MerchantdetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  merchantForm!: FormGroup;
  merchantSForm!: FormGroup;
  userid: string = '';
  merchantId: string = '';
  merchantdetailsList: any;
  page: number = 0;
  pageSize: number = 10;

  total: number = 0;
  cPageVal!: number;
  toPageVal!: number;

  areaList: any = [];

  dropdownSettings = {};
  dropdownList = [];
  selectedItems = [];
  pickdropzonelist: any = [];

  constructor(
    private formbuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private shareDateService: DataService,
    private merchantService: MerchantService,
    private configservice: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
    this.merchantId = this.shareDateService.getSharedData().id;
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    this.getallZone();
    this.merchantdformRefresh();
    this.merchantdSForm();
    this.getAllmerchant();
  }

  merchantdformRefresh() {
    this.merchantForm = this.formbuilder.group({
      id: [null],
      merchantId: [`${this.merchantId}`, [Validators.required]],
      locationType: [''],
      name: ['', [Validators.required]],
      house: ['', [Validators.required]],
      road: ['', [Validators.required]],
      area: ['', [Validators.required]],
      policeStation: ['', [Validators.required]],
      district: ['Dhaka', [Validators.required]],
      country: ['Bangladesh', [Validators.required]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      altPhoneNumber: [
        '',
        [Validators.minLength(11), Validators.maxLength(11)],
      ],
      walletPhoneNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      active: [true],
      deleted: [false],
    });
  }

  getZoneName(string: any) {
    let a: any = this.dropdownList.filter((x: any) => x.id == string);
    if (a.length > 0) {
      return a[0].customtext;
    }
    else{
      return '';
    }
  }

  get f() {
    return this.merchantForm.controls;
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
          this.dropdownList = list;
        },
      });
  }

  onInitiatorItemSelect(item: any) {
    this.merchantForm.controls['area'].setValue(item.id);
  }

  onInitiatorItemUnSelect(item: any) {
    this.merchantForm.controls['area'].setValue('');
  }

  // getZoneName(string: any) {
  //   let a: any = this.dropdownList.filter((x: any) => x.id == string);
  //   return a[0].customtext;
  // }

  // get f() {
  //   return this.merchantForm.controls;
  // }

  // onPageChange(event: number) {
  //   this.loader = true;
  //   this.toPageVal = event * this.pageSize;
  //   this.page = event - 1;

  //   this.cPageVal = (event - 1) * this.pageSize + 1;

  //   if (this.toPageVal > this.total) {
  //     this.toPageVal = this.total;
  //   }
  //   this.getAllmerchant();
  //   return event;
  // }

  // getallZone() {
  //   let list: any = [];
  //   this.configservice
  //     .getAllZone(0, 2000, '')
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe({
  //       next: (res: any) => {
  //         res.data.content.map((content: any) => {
  //           list.push({ id: content.id, customtext: content.name });
  //         });
  //       },
  //       error: (err: any) => {
  //         console.error(err);
  //         this.loader = false;
  //       },
  //       complete: () => {
  //         this.dropdownList = list;
  //       },
  //     });
  // }

  // onInitiatorItemSelect(item: any) {
  //   this.merchantForm.controls['area'].setValue(item.id);
  // }

  // onInitiatorItemUnSelect(item: any) {
  //   this.merchantForm.controls['area'].setValue('');
  // }

  merchantdSForm() {
    this.merchantSForm = this.formbuilder.group({
      number: [''],
    });
  }

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  getAllmerchant() {
    this.merchantService
      .getMerchantDetail(
        this.merchantId,
        this.page,
        this.pageSize,
        this.merchantSForm.controls['number'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.merchantdetailsList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
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

  addMerchant() {
    if (this.f['id'].value) {
      this.merchantService
        .updateMerchantDetail(this.merchantForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.message);
            } else {
              this.successmsg(res.message);
              this.merchantdformRefresh();
              this.showAddBtn = true;
              this.getAllmerchant();
            }
          },
          error: (err) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {},
        });
    } else {
      this.merchantService
        .addMerchantDetail(this.merchantForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.message);
            } else {
              this.successmsg(res.message);
              this.merchantdformRefresh();
              this.showAddBtn = true;
              this.getAllmerchant();
            }
          },
          error: (err) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {},
        });
    }
  }

  editUser(data: any) {
    this.merchantForm.controls['id'].setValue(data.id);
    this.merchantForm.controls['merchantId'].setValue(data.merchantId);
    this.merchantForm.controls['locationType'].setValue(data.locationType);
    this.merchantForm.controls['name'].setValue(data.name);
    this.merchantForm.controls['house'].setValue(data.house);
    this.merchantForm.controls['road'].setValue(data.road);
    this.merchantForm.controls['area'].setValue(data.area);
    this.merchantForm.controls['policeStation'].setValue(data.policeStation);
    this.merchantForm.controls['district'].setValue(data.district);
    this.merchantForm.controls['country'].setValue(data.country);
    this.merchantForm.controls['phoneNumber'].setValue(data.phoneNumber);
    this.merchantForm.controls['altPhoneNumber'].setValue(data.altPhoneNumber);
    this.merchantForm.controls['walletPhoneNumber'].setValue(
      data.walletPhoneNumber
    );
    this.merchantForm.controls['active'].setValue(data.active);
    this.merchantForm.controls['deleted'].setValue(data.deleted);
    this.selectedItems = this.dropdownList.filter(
      (d: any) => d.id == data.area
    );
    this.showAddBtn = false;
  }

  toggleAddOrderBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
