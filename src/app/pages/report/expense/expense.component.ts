import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReportService } from 'src/app/core/service/report.service';
import { RoleService } from 'src/app/core/service/role.service';
import { filter } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})
export class ExpenseComponent implements OnInit, OnDestroy {
  @ViewChild('reporttable') table!: ElementRef;
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = true;
  reprotForm!: FormGroup;
  totalExpenseReport: any = [];
  existingUserList: any = [];

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formbuilder: FormBuilder,
    private orderService: ReportService,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {

    this.getAllusers();
    this.reportFormReferesh();
    this.getExpense();
  }

  reportFormReferesh() {
    this.reprotForm = this.formbuilder.group({
      fromDate: [`${this.currentdate}`],
      toDate: [`${this.currentdate}`]
    });
  }

  get f() {
    return this.reprotForm.controls;
  }

  getExpense() {
    this.orderService
      .getExpenseReport(this.f['fromDate'].value, this.f['toDate'].value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.totalExpenseReport = res.data;
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

  downloadXl() {
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
    // const newWorksheet = XLSX.utils.aoa_to_sheet([
    //   ['Expense', 'Profit'],
    //   [this.totalExpense, this.totalProfit],
    // ]);

    // // Add the new worksheet to the workbook
    // XLSX.utils.book_append_sheet(wb, newWorksheet, 'profit');

    /* save to file */
    XLSX.writeFile(wb, 'Expense.xlsx');
  }

  getUserInfo(user: string) {
    let a = this.existingUserList.filter((x: any) => x.id == user);
    if (a) {
      return a[0].firstName + " " + a[0].lastName + " - " + a[0].mobile;
    }
    return ""
  }

  getAllusers() {
    this.roleService
      .getAllusers(0, 1000, "")
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.existingUserList = res.data.content;
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
  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
