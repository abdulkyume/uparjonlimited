import { TestBed } from '@angular/core/testing';

import { InventorySalesService } from './inventory-sales.service';

describe('InventorySalesService', () => {
  let service: InventorySalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
