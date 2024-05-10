import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FaqService } from 'src/app/core/service/faq.service';
import {
  NgbAccordionModule,
  NgbPanelChangeEvent,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  itemList: any[] = [];
  lastPanelId: string = '';
  defaultPanelId: string = 'panel2';

  constructor(private configservice: FaqService) {}

  ngOnInit(): void {
    this.getallItem();
  }

  getallItem() {
    this.configservice
      .getAllFaq()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.itemList = res.data;
          this.itemList.sort((a: any, b: any) => a.serial - b.serial);
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {},
      });
  }

  panelShadow($event: any, shadow: any) {
    const { nextState } = $event;

    const activePanelId = $event.panelId;
    const activePanelElem = document.getElementById(activePanelId);

    if (!shadow.isExpanded(activePanelId)) {
      activePanelElem!.parentElement!.classList.add('open');
    }

    if (!this.lastPanelId) this.lastPanelId = this.defaultPanelId;

    if (this.lastPanelId) {
      const lastPanelElem = document.getElementById(this.lastPanelId);

      if (this.lastPanelId === activePanelId && nextState === false)
        activePanelElem!.parentElement!.classList.remove('open');
      else if (this.lastPanelId !== activePanelId && nextState === true) {
        lastPanelElem!.parentElement!.classList.remove('open');
      }
    }

    this.lastPanelId = $event.panelId;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
