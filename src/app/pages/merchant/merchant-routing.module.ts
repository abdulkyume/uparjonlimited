import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerchantComponent } from './merchant/merchant.component';
import { MerchantdetailsComponent } from './merchantdetails/merchantdetails.component';
import { OrderComponent } from './order/order.component';

const routes: Routes = [
  { path: 'merchant', component: MerchantComponent },
  { path: 'order', component: OrderComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantRoutingModule { }
