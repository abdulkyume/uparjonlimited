import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { Subject, takeUntil } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import Swal from 'sweetalert2';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { OrderService } from 'src/app/core/service/order.service';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPaginationModule,
  ],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
})
export class ExpenseComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  showAddBtn: boolean = true;
  itemForm!: FormGroup;
  itemSForm!: FormGroup;

  itemList: any;

  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal!: number;
  total!: number;
  userid!: string;

  constructor(
    private formBuilder: FormBuilder,
    private configservice: OrderService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    
    this.itemSRefreshForm();
    this.getallItem();
    this.itemRefreshForm();

  }

  itemRefreshForm() {
    this.itemForm = this.formBuilder.group({
      id: [null],
      userId: [this.userid],
      name: ['Fuel for Car', [Validators.required]],
      amount: [0, [Validators.required]],
      note: [''],
      expenseDate: ['', [Validators.required]],
    });
  }

  itemSRefreshForm() {
    this.itemSForm = this.formBuilder.group({
      userId: [this.userid],
      fromDate: [""],
      toDate: [""],
    });
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event-1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getallItem();
    return event;
  }

  getallItem() {
    this.configservice
      .getAllexpense(
        this.page,
        this.pageSize,
        this.userid,
        this.itemSForm.controls["fromDate"].value,
        this.itemSForm.controls["toDate"].value,
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.itemList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.itemList.length;
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

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  editItem(data: any) {
    this.itemForm.controls['id'].setValue(data.id);
    this.itemForm.controls['name'].setValue(data.name);
    this.itemForm.controls['amount'].setValue(data.amount);
    this.itemForm.controls['note'].setValue(data.note);
    this.itemForm.controls['expenseDate'].setValue(data.expenseDate);
    this.showAddBtn = false;
  }
  onsubmit() {
    if (this.itemForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.itemForm.controls['id'].value) {
      this.configservice
        .updateExpense(this.itemForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.itemRefreshForm();
              this.showAddBtn = true;
              this.getallItem();
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
      this.configservice
        .addExpense(this.itemForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.itemRefreshForm();
              this.showAddBtn = true;
              this.getallItem();
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

  toggleAddBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
