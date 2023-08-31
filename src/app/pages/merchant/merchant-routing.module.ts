import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerchantComponent } from './merchant/merchant.component';
import { MerchantdetailsComponent } from './merchantdetails/merchantdetails.component';

const routes: Routes = [
  { path: 'merchant', component: MerchantComponent },
  { path: 'merchantd', component: MerchantdetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantRoutingModule {}
