import { CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from './can-component-deactivate';

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component
) => {

  return component.canDeactivate();

};