import { Injectable } from '@angular/core';

@Injectable()
export class AdminService {

  getMessage(): string {
    return 'AdminService u ngarkua me Lazy Loading.';
  }

}