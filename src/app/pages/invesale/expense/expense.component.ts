import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { RoleService } from 'src/app/core/service/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    NgbPagination,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgMultiSelectDropDownModule,
    FormsModule,
  ],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})
export class ExpenseComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  showAddBtn: boolean = true;
  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal: number = 0;
  total: number = 0;
  userid: string = '';
  dueList: any[] = [];
  expenseSForm!: FormGroup;
  expenseForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;
  inventoryList = new Map();
  inventoryDetailList = new Map();
  shopList = new Map();
  dsoList = new Map();

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;


  private insService = inject(InventorySalesService);
  private roleService = inject(RoleService);
  private encryptionService = inject(EncryptionService);
  private formBuilder = inject(FormBuilder);

  get f() {
    return this.expenseForm.controls;
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'value',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
    this.getAllDSO();
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;

    this.dueSRefreshForm();
    this.getAllExpense();
    this.expenseSRefreshForm();
  }


  getAllDSO(): void {
    let data: any = [];
    this.roleService
      .getAllusers(0, 1000, '', 'e4151052-bf99-947b-1c8e-ee934cc685d5')
      .subscribe({
        next: (res: any) => {
          res.data.content.map((content: any) => {
            let a = {
              id: content.id,
              value: `${content.firstName} ${content.lastName}\n${content.mobile}`,
            };
            this.dsoList.set(content.id, `${content.firstName} ${content.lastName}<br/>${content.mobile}`);
            data.push(a);
          });
        },
        error: (error: any) => {
          this.loader = false;
          console.error('Error:', error);
        },
        complete: () => {
          this.dropdownList = data;
        },
      });
  }

  dueSRefreshForm(): void {
    this.expenseSForm = this.formBuilder.group({
      dsoId: [''],
      orderNo: [''],
      dateFrom: [this.currentdate],
      dateTo: [this.currentdate],
    });
    this.selectedItems = [];
  }

  expenseSRefreshForm(): void {
    this.expenseForm = this.formBuilder.group({
      id: [''],
      dsoId: [this.userid],
      name: [''],
      amount: [''],
      orderNo: [''],
      note: [''],
      date:[this.currentdate],
      deleted: [false],
    });
    this.selectedItems = [];
  }

  toggleAddBtn(): void {
    if (this.showAddBtn) {
      this.showAddBtn = false;
    } else {
      this.showAddBtn = true;
    }
    this.expenseSRefreshForm();
    this.dueSRefreshForm();
  }

  onsubmit() {
    if (this.expenseForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.expenseForm.controls['id'].value) {
      this.insService
        .updateExpense(this.expenseForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.expenseSRefreshForm();
              this.showAddBtn = true;
              this.getAllExpense();
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
      this.insService
        .addExpense(this.expenseForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.expenseSRefreshForm();
              this.showAddBtn = true;
              this.getAllExpense();
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

  getAllExpense(): void {
    this.insService
      .getAllExpense(
        this.page,
        this.pageSize,
        this.expenseSForm.controls['orderNo'].value,
        this.expenseSForm.controls['dsoId'].value,
        this.expenseSForm.controls['dateFrom'].value,
        this.expenseSForm.controls['dateTo'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.dueList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.dueList.length;
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

  
  editExpense(data: any) {
    this.selectedItems = this.dropdownList.filter(
      (item: any) => item.id === data.dsoId
    );
    this.expenseForm.controls['id'].setValue(data.id);
    this.expenseForm.controls['name'].setValue(data.name);
    this.expenseForm.controls['amount'].setValue(data.amount);
    this.expenseForm.controls['orderNo'].setValue(data.orderNo);
    this.expenseForm.controls['note'].setValue(data.note);
    this.expenseForm.controls['dsoId'].setValue(data.dsoId);
    this.expenseForm.controls['date'].setValue(data.date.split("T")[0]);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteExpense(id: string): void {
    this.loader = true;
    this.insService.deleteExpense(id).subscribe({
      next: (res: any) => {
        this.getAllExpense();
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

  onPageChange(event: number): number {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event - 1;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getAllExpense();
    return event;
  }

  onInitiatorItemSelect(item: any): void {
    this.f['dsoId'].setValue(item.id);
  }

  onInitiatorItemUnSelect(item: any): void {
    this.f['dsoId'].setValue('');
  }

  successmsg(message: string): void {
    Swal.fire('Success!', message, 'success');
  }

  errorssmsg(message: string): void {
    Swal.fire('Ops!', message, 'error');
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}