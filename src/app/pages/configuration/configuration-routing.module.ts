import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemComponent } from './item/item.component';
import { PickdropzoneComponent } from './pickdropzone/pickdropzone.component';
import { PaymentComponent } from './payment/payment.component';

const routes: Routes = [
  { path: 'item', component: ItemComponent },
  { path: 'pickdrop', component: PickdropzoneComponent },
  { path: 'payment', component: PaymentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigurationRoutingModule {}
