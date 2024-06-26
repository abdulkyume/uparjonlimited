import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorydetailsComponent } from './inventorydetails.component';

describe('InventorydetailsComponent', () => {
  let component: InventorydetailsComponent;
  let fixture: ComponentFixture<InventorydetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InventorydetailsComponent]
    });
    fixture = TestBed.createComponent(InventorydetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
