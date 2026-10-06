import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Car {
  brand: string;
  model: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarService {

  // HttpClient
  private http = inject(HttpClient);

  // URL e API-së
  private url = 'https://jsonplaceholder.typicode.com/posts';

  // Postimet ruhen në Service
  posts = signal<Post[]>([]);

  // =========================
  // GET - Merr të gjitha postimet
  // =========================

  loadPosts() {
    return this.http.get<Post[]>(this.url);
  }

  // =========================
  // Ruaj postimet në Service
  // =========================

  setPosts(posts: Post[]) {
    this.posts.set(posts);
  }

  // =========================
  // GET - Merr një postim
  // =========================

  getPost(id: number) {
    return this.http.get<Post>(`${this.url}/${id}`);
  }

  // =========================
  // POST - Shton një makinë
  // =========================

  addCar(car: Car) {
    return this.http.post<Car>(this.url, car);
  }

  // =========================
  // DELETE - Fshin një postim
  // =========================

  deletePost(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

}