import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyComponent } from './daily/daily.component';
import { ExpenseComponent } from './expense/expense.component';

const routes: Routes = [
  { path: 'order', component: DailyComponent },
  { path: 'expense', component: ExpenseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule { }
