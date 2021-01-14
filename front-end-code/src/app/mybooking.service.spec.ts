import { TestBed } from '@angular/core/testing';

import { MybookingService } from './mybooking.service';

describe('MybookingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MybookingService = TestBed.get(MybookingService);
    expect(service).toBeTruthy();
  });
});
