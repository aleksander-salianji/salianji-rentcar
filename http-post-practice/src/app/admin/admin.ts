import { Component, inject } from '@angular/core';
import { AdminService } from './admin-service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  private adminService = inject(AdminService);

  message = '';

  ngOnInit() {
    this.message = this.adminService.getMessage();
  }

}