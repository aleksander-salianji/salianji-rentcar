import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { carResolver } from './car-resolver';

describe('carResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => carResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
