import { TestBed } from '@angular/core/testing';

import { CustomerBookingService } from './customer-booking.service';

describe('CustomerBookingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomerBookingService = TestBed.get(CustomerBookingService);
    expect(service).toBeTruthy();
  });
});
