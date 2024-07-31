import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDailyComponent } from './sales-daily.component';

describe('SalesDailyComponent', () => {
  let component: SalesDailyComponent;
  let fixture: ComponentFixture<SalesDailyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SalesDailyComponent]
    });
    fixture = TestBed.createComponent(SalesDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
