import { TestBed } from '@angular/core/testing';

import { BusbookingService } from './busbooking.service';

describe('BusbookingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BusbookingService = TestBed.get(BusbookingService);
    expect(service).toBeTruthy();
  });
});
