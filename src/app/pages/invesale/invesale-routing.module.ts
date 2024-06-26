import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DueComponent } from './due/due.component';
import { ExpenseComponent } from './expense/expense.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventorydetailsComponent } from './inventorydetails/inventorydetails.component';
import { OrderComponent } from './order/order.component';
import { ReturnComponent } from './return/return.component';
import { SalesComponent } from './sales/sales.component';
import { ShopComponent } from './shop/shop.component';

const routes: Routes = [
  { path: 'due', component: DueComponent },
  { path: 'expense', component: ExpenseComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'inventory-details', component: InventorydetailsComponent },
  { path: 'order', component: OrderComponent },
  { path: 'return', component: ReturnComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'shop', component: ShopComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvesaleRoutingModule {}
