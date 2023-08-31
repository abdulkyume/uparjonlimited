import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'access-management',
    loadChildren: () =>
      import('./accessmangement/accessmangement.module').then(
        (m) => m.AccessmangementModule
      ),
  },
  {
    path: 'order-placement',
    loadChildren: () =>
      import('./orderplacement/orderplacement.module').then(
        (m) => m.OrderplacementModule
      ),
  },
  {
    path: 'report',
    loadChildren: () =>
      import('./report/report.module').then((m) => m.ReportModule),
  },
  {
    path: 'merchant',
    loadChildren: () =>
      import('./merchant/merchant.module').then((m) => m.MerchantModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
