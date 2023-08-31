import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
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

@Component({
  selector: 'app-merchantdetails',
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './merchantdetails.component.html',
  styleUrls: ['./merchantdetails.component.scss'],
})
export class MerchantdetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  showAddBtn: boolean = true;
  merchantForm!: FormGroup;
  merchantForm!: FormGroup;
  userid: string = '';
  merchantdetailsList: any;
  page: number = 0;
  pageSize: number = 0;

  constructor(
    private formbuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private shareDateService: DataService,
    private merchantService: MerchantService
  ) {}

  ngOnInit(): void {
    this.merchantdformRefresh();
    // this.userid = (JSON.parse(this.encryptionService.decrypt(localStorage.getItem("currentUser")!))).id;
    this.userid = '16b23cbe-32cd-4f57-a3de-1cc2950ae0e0';
    this.getAllmerchant();
  }

  merchantdformRefresh() {
    this.merchantForm = this.formbuilder.group({
      id: [null],
      merchantId: [this.shareDateService.getSharedData().id],
      locationType: [''],
      name: ['', [Validators.required]],
      house: ['', [Validators.required]],
      road: ['', [Validators.required]],
      area: ['', [Validators.required]],
      policeStation: ['', [Validators.required]],
      district: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      altPhoneNumber: [''],
      walletNumber: ['', [Validators.required]],
    });
  }

  merchantdSForm() {}

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  getAllmerchant() {
    this.merchantService.getMerchantDetail(
      this.userid,
      this.page,
      this.pageSize
    );
  }

  addMerchant() {
    this.merchantService
      .addMerchantDetail(this.merchantForm.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (!res.isSuccess) {
            this.loader = false;
            this.errorssmsg(res.reason);
          } else {
            this.successmsg(res.reason);
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

  editUser(data: any) {}

  toggleAddOrderBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
