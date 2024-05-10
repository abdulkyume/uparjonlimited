import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqcrudComponent } from './faqcrud/faqcrud.component';

const routes: Routes = [{ path: 'set-faq', component: FaqcrudComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqRoutingModule {}
