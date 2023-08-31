import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LAYOUT_HORIZONTAL,
  LAYOUT_VERTICAL,
  LAYOUT_WIDTH,
  TOPBAR,
} from '../core/models/layout';
import { VerticalComponent } from './vertical/vertical.component';
import { HorizontalComponent } from './horizontal/horizontal.component';
import { EventService } from '../core/service/event.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [CommonModule, VerticalComponent, HorizontalComponent],
})
export class LayoutComponent {
  layoutType!: string;
  layoutwidth!: string;
  topbar!: string;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    // default settings
    this.layoutType = LAYOUT_VERTICAL;
    this.layoutwidth = LAYOUT_WIDTH;
    this.topbar = TOPBAR;

    // listen to event and change the layout, theme, etc
    this.eventService.subscribe('changeLayout', (layout: any) => {
      this.layoutType = layout;
    });

    this.LayoutWidth(this.layoutwidth);

    this.eventService.subscribe('changeWidth', (width: any) => {
      this.layoutwidth = width;
      this.LayoutWidth(this.layoutwidth);
    });
  }

  LayoutWidth(width: string) {
    switch (width) {
      case 'fluid':
        document.body.setAttribute('data-layout-size', 'fluid');
        document.body.classList.remove('vertical-collpsed');
        document.body.removeAttribute('data-layout-scrollable');
        break;
      case 'boxed':
        document.body.setAttribute('data-layout-size', 'boxed');
        document.body.classList.add('vertical-collpsed');
        document.body.removeAttribute('data-layout-scrollable');
        break;
      case 'scrollable':
        document.body.removeAttribute('data-layout-size');
        document.body.setAttribute('data-layout-scrollable', 'true');
        document.body.setAttribute('data-layout-size', 'fluid');
        document.body.classList.remove(
          'right-bar-enabled',
          'vertical-collpsed'
        );
        break;
      default:
        document.body.setAttribute('data-layout-size', 'fluid');
        break;
    }
  }

  /**
   * Check if the vertical layout is requested
   */
  isVerticalLayoutRequested() {
    return this.layoutType === LAYOUT_VERTICAL;
  }

  /**
   * Check if the horizontal layout is requested
   */
  isHorizontalLayoutRequested() {
    return this.layoutType === LAYOUT_HORIZONTAL;
  }
}
