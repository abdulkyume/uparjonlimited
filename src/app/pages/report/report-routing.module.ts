import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyComponent } from './daily/daily.component';
import { ExpenseComponent } from './expense/expense.component';
import { SalesDailyComponent } from './sales-daily/sales-daily.component';

const routes: Routes = [
  { path: 'order', component: DailyComponent },
  { path: 'sales-daily', component: SalesDailyComponent },
  { path: 'expense', component: ExpenseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
