import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { NgbDropdownModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RoleService } from 'src/app/core/service/role.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-due',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    NgbPagination,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgMultiSelectDropDownModule,
    FormsModule
  ],
  templateUrl: './due.component.html',
  styleUrls: ['./due.component.scss'],
})
export class DueComponent implements OnInit, OnDestroy {
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
  dueSForm!: FormGroup;
  dueForm!: FormGroup;
  dropdownSettings = {};
  dropdownList = [];
  selectedItems: any;

  private insService = inject(InventorySalesService);
  private roleService = inject(RoleService);
  private encryptionService = inject(EncryptionService);
  private formBuilder = inject(FormBuilder);

  get f() {
    return this.dueForm.controls;
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
    this.getAllDue();
    this.dueRefreshForm();
  }

  getAllDSO(): void {
    let data: any = [];
    this.roleService
      .getAllusers(0, 1000, '', 'e4151052-bf99-947b-1c8e-ee934cc685d5')
      .subscribe({
        next: (res: any) => {
          res.data.content.map((content: any) => {
            data.push({
              id: content.id,
              value: `${content.firstName} ${content.lastName} - ${content.mobile}`,
            });
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
    this.dueSForm = this.formBuilder.group({
      dsoId: [this.userid],
      inventoryItemId: [''],
      shopId: [''],
      orderId: [''],
    });
  }

  dueRefreshForm(): void {
    this.dueForm = this.formBuilder.group({
      id: [''],
      dueAmount: [0],
      inventoryItemId: [''],
      shopId: [''],
      orderId: [''],
      dsoId: [''],
      deleted: [false],
    });
  }

  toggleAddBtn(): void {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  onsubmit() {
    if (this.dueForm.invalid) {
      return;
    }
    this.loader = true;
    if (this.dueForm.controls['id'].value) {
      this.insService
        .updateDue(this.dueForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.dueRefreshForm();
              this.showAddBtn = true;
              this.getAllDue();
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
        .addDue(this.dueForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.dueRefreshForm();
              this.showAddBtn = true;
              this.getAllDue();
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

  getAllDue(): void {
    this.insService
      .getAllDue(
        this.page,
        this.pageSize,
        this.dueSForm.controls['inventoryItemId'].value,
        this.dueSForm.controls['shopId'].value,
        this.dueSForm.controls['orderId'].value,
        this.dueSForm.controls['dsoId'].value
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

  editDue(data: any) {
    this.dueForm.controls['id'].setValue(data.id);
    this.dueForm.controls['dueAmount'].setValue(data.dueAmount);
    this.dueForm.controls['inventoryItemId'].setValue(data.inventoryItemId);
    this.dueForm.controls['shopId'].setValue(data.shopId);
    this.dueForm.controls['orderId'].setValue(data.orderId);
    this.dueForm.controls['dsoId'].setValue(data.dsoId);
    this.dueForm.controls['deleted'].setValue(data.deleted);
    this.showAddBtn = false;
    window.scrollTo(0, 0);
  }

  deleteDue(id: string): void {
    this.loader = true;
    this.insService.deleteDue(id).subscribe({
      next: (res: any) => {
        this.getAllDue();
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
    this.getAllDue();
    return event;
  }

  onInitiatorItemSelect(item: any): void {
    this.f['dsoId'].setValue(item);
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
