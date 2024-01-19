import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderComponent } from './order/order.component';
import { ExpenseComponent } from './expense/expense.component';
import { PendingorderComponent } from './pendingorder/pendingorder.component';

const routes: Routes = [
  {
    path: 'order', component: OrderComponent
  },
  {
    path: 'expense', component: ExpenseComponent
  },
  {
    path: 'pending-order', component: PendingorderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiderRoutingModule { }
