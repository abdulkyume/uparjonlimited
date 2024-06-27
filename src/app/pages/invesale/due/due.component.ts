import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from 'src/app/core/service/encryption.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-due',
  standalone: true,
  imports: [CommonModule, LoaderComponent, NgbPagination],
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

  private insService = Inject(InventorySalesService);
  private encryptionService = Inject(EncryptionService);
  private formBuilder = Inject(FormBuilder);

  ngOnInit(): void {
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;

    this.dueSRefreshForm();
    this.getAllDue();
    // this.itemRefreshForm();
  }

  dueSRefreshForm(): void {
    this.dueSForm = this.formBuilder.group({
      userId: [this.userid],
      fromDate: [''],
      toDate: [''],
    });
  }

  toggleAddBtn(): void {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  getAllDue(): void {
    this.insService
      .getAllDue(
        this.page,
        this.pageSize,
        this.userid,
        this.dueSForm.controls['fromDate'].value,
        this.dueSForm.controls['toDate'].value
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
