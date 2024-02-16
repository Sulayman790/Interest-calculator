import { TestBed } from '@angular/core/testing';

import { SubscribersService } from './subscriber.service';

describe('SubscribersService', () => {
  let service: SubscribersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscribersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
