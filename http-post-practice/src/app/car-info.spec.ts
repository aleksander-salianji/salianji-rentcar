import { TestBed } from '@angular/core/testing';
import { CarInfo } from './car-info';

describe('CarInfo', () => {
  let service: CarInfo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarInfo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
