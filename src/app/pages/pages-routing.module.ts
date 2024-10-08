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
    path: 'rider',
    loadChildren: () =>
      import('./rider/order.module').then((m) => m.RiderModule),
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

  {
    path: 'configuration',
    loadChildren: () =>
      import('./configuration/configuration-routing.module').then(
        (m) => m.ConfigurationRoutingModule
      ),
  },

  {
    path: 'faq',
    loadChildren: () =>
      import('./faq/faq-routing.module').then((m) => m.FaqRoutingModule),
  },

  {
    path: 'inventory-sales',
    loadChildren: () =>
      import('./invesale/invesale.module').then((m) => m.InvesaleModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
