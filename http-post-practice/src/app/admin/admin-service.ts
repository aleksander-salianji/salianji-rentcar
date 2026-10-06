import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  getMessage(): string {
    return 'AdminService u ngarkua me Lazy Loading.';
  }

}