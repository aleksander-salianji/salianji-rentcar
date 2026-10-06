import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { CarService, Post, Car } from './services/car';
import { ErrorHandlerService } from './services/error-handler';


@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterLink,
    RouterOutlet
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  // =========================
  // SERVICES
  // =========================

  private carService = inject(CarService);

  private errorHandler = inject(ErrorHandlerService);


  // =========================
  // POSTS
  // =========================

  posts = this.carService.posts;


  // =========================
  // CARS
  // =========================

  cars: Car[] = [];


  // =========================
  // SELECTED POST
  // =========================

  selectedPost: Post | null = null;


  // =========================
  // LOADING
  // =========================

  isLoading = signal(false);


  // =========================
  // ERROR
  // =========================

  errorMessage = '';


  // ==================================================
  // POST - SHTO BMW X5
  // ==================================================

  addCar() {

    const car: Car = {

      brand: 'BMW',

      model: 'X5',

      price: 80

    };


    // Ruajme pozicionin
    // ku do te shkoje makina

    const index = this.cars.length;


    // ==================================================
    // OPTIMISTIC UPDATE
    // ==================================================

    // Makina shfaqet menjehere ne UI

    this.cars.push(car);


    // ==================================================
    // DËRGO REQUEST-IN NË BACKEND
    // ==================================================

    this.carService.addCar(car).subscribe({

      next: (response) => {

        // Request-i u krye me sukses

      },

      error: (error) => {

        // Menaxhojme gabimin

        this.errorHandler.handleError(error);


        // ==================================================
        // ROLLBACK
        // ==================================================

        // Nese request-i deshton,
        // heqim makinen nga UI

        this.cars.splice(index, 1);

      }

    });

  }


  // ==================================================
  // GET - MERR TE GJITHA POSTIMET
  // ==================================================

  loadPosts() {

    // Filloi loading

    this.isLoading.set(true);


    // Pastrojme error-in e meparshem

    this.errorMessage = '';


    // ==================================================
    // HTTP GET
    // ==================================================

    this.carService.loadPosts().subscribe({

      next: (posts) => {

        // Ruajme postimet ne Service

        this.carService.setPosts(posts);


        // Request-i perfundoi

        this.isLoading.set(false);

      },

      error: (error) => {

        // Menaxhojme gabimin

        this.errorHandler.handleError(error);


        this.errorMessage =
          'Ndodhi nje gabim gjate marrjes se te dhenave.';


        // Mbyll loading

        this.isLoading.set(false);

      }

    });

  }


  // ==================================================
  // GET - MERR NJË POSTIM
  // ==================================================

  loadSinglePost(id: number) {

    this.carService.getPost(id).subscribe({

      next: (post) => {

        // Ruajme postimin

        this.selectedPost = post;

      },

      error: (error) => {

        // Menaxhojme gabimin

        this.errorHandler.handleError(error);

      }

    });

  }


  // ==================================================
  // DELETE - FSHIN NJË POSTIM
  // ==================================================

  deletePost(id: number) {

    this.carService.deletePost(id).subscribe({

      next: (response) => {

        // Postimi u fshi me sukses

      },

      error: (error) => {

        // Menaxhojme gabimin

        this.errorHandler.handleError(error);

      }

    });

  }

}