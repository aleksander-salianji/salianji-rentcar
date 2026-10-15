import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminService } from './admin-service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  private adminService = inject(AdminService);

  message = '';

  // Statistikat e dashboard-it
  totalCars = 5;
  totalBookings = 0;
  totalCustomers = 0;
  totalRevenue = 0;

  ngOnInit(): void {

    this.message = this.adminService.getMessage();

  }

}