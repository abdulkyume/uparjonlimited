import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { MerchantService } from 'src/app/core/service/merchant.service';
import Swal from 'sweetalert2';
import { NgbDropdownModule, NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';
import { MerchantdetailsComponent } from '../merchantdetails/merchantdetails.component';
import { DataService } from 'src/app/core/service/data.service';

@Component({
  selector: 'app-merchant',
  standalone: true,
  imports: [CommonModule, MerchantdetailsComponent, NgbDropdownModule, UiSwitchModule, NgbPaginationModule, LoaderComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './merchant.component.html',
  styleUrls: ['./merchant.component.scss']
})
export class MerchantComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  showAddBtn: boolean = true;
  merchantForm!: FormGroup;
  merchantSForm!: FormGroup;
  userid: string = "";
  merchantList: any;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal!: number;
  total!: number;

  constructor(private formbuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private shareDateService: DataService,
    private modalService: NgbModal,
    private merchantService: MerchantService) { }

  ngOnInit(): void {
    this.merchantformRefresh();
    this.merchantSformRefresh();

    this.userid = (JSON.parse(this.encryptionService.decrypt(localStorage.getItem("currentUser")!))).id;
    this.getAllmerchant();
  }

  merchantformRefresh() {
    this.merchantForm = this.formbuilder.group({
      id: [null],
      name: ["", [Validators.required, Validators.minLength(2)]],
    })
  }
  merchantSformRefresh() {
    this.merchantSForm = this.formbuilder.group({
      sname: [""],
    })
  }

  deletemerchant(data: any) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger ms-2",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Do you want to Delete!",
        icon: "warning",
        confirmButtonText: "Yes!",
        cancelButtonText: "No!",
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          this.loader = true;

          data.deleted = true;
          this.merchantService.updateMerchant(data).subscribe({
            next: (res: any) => {
              if (res.isSuccess || res.statusCode == 200) {
                this.successmsg(res.message)
              }
              else {
                this.errorssmsg(res.message)
              }
            },
            error: (err: any) => {
              console.error(err);
              this.loader = false;
            },
            complete: () => {
              this.getAllmerchant()
              window.scrollTo(0, 0);
              this.loader = false;
            }
          })
        }
      });
  }
  Search() {
    this.getAllmerchant();
  }

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  getAllmerchant() {
    this.loader = true;
    this.merchantService.getMercahnt(this.page, this.pageSize, this.merchantSForm.controls["sname"].value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.merchantList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          }
          else {
            this.toPageVal = this.merchantList.length;
          }
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.loader = false;
        }
      });
  }

  editUser(data: any) {
    this.merchantForm.controls["id"].setValue(data.id);
    this.merchantForm.controls["name"].setValue(data.name);
    this.showAddBtn = false
  }
  addMerchant() {
    if (this.merchantForm.invalid) {
      return;
    }

    this.loader = true;
    if (this.merchantForm.controls["id"].value) {
      this.merchantService.updateMerchant(this.merchantForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.merchantformRefresh();
              this.showAddBtn = true;
              this.getAllmerchant();
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
    else {
      this.merchantService.addMerchantForm(this.merchantForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.merchantformRefresh();
              this.showAddBtn = true;
              this.getAllmerchant();
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

  }

  toggleAddOrderBtn() {
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
    this.getAllmerchant();
    return event;
  }

  adddetails(content: any, data: any) {
    this.shareDateService.setSharedData(data);
    this.modalService.open(content, {
      size: "xl",
      backdrop: "static",
      centered: true,
      scrollable: true,
      windowClass: 'customcss'
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
