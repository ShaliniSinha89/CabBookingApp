import { TestBed } from '@angular/core/testing';

import { RideSignalrService } from './ride-signalr.service';

describe('RideSignalrService', () => {
  let service: RideSignalrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideSignalrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
