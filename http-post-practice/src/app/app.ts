import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

interface Post {
  id: number;
  title: string;
  body: string;
  userId?: number;
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private http = inject(HttpClient);

  posts: Post[] = [];

  selectedPost: Post | null = null;

  newPostTitle = '';

  newPostBody = '';

  message = '';

  errorMessage = '';

  deleteMessage = '';

  loadPosts(): void {

    this.message = 'Duke ngarkuar postimet...';

    this.errorMessage = '';

    this.http
      .get<Post[]>(
        'https://jsonplaceholder.typicode.com/posts'
      )
      .subscribe({
        next: (posts) => {

          this.posts = posts;

          this.message =
            `U ngarkuan ${posts.length} postime.`;
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Gabim gjatë marrjes së postimeve.';
        }
      });
  }

  loadSinglePost(id: number): void {

    this.selectedPost = null;

    this.errorMessage = '';

    this.http
      .get<Post>(
        `https://jsonplaceholder.typicode.com/posts/${id}`
      )
      .subscribe({
        next: (post) => {

          this.selectedPost = post;
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Gabim gjatë marrjes së postimit.';
        }
      });
  }

  addPost(): void {

    if (
      !this.newPostTitle.trim() ||
      !this.newPostBody.trim()
    ) {

      this.errorMessage =
        'Plotëso titullin dhe përmbajtjen.';

      return;
    }

    const newPost = {

      title: this.newPostTitle,

      body: this.newPostBody,

      userId: 1
    };

    this.http
      .post<Post>(
        'https://jsonplaceholder.typicode.com/posts',
        newPost
      )
      .subscribe({
        next: (post) => {

          console.log(
            'Postimi u krijua:',
            post
          );

          this.posts = [
            post,
            ...this.posts
          ];

          this.message =
            `Postimi "${post.title}" u krijua me sukses.`;

          this.newPostTitle = '';

          this.newPostBody = '';
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Gabim gjatë krijimit të postimit.';
        }
      });
  }

  deletePost(id: number): void {

    this.deleteMessage = '';

    this.errorMessage = '';

    this.http
      .delete(
        `https://jsonplaceholder.typicode.com/posts/${id}`
      )
      .subscribe({
        next: () => {

          this.posts =
            this.posts.filter(
              post => post.id !== id
            );

          if (
            this.selectedPost?.id === id
          ) {

            this.selectedPost = null;
          }

          this.deleteMessage =
            `Postimi me ID ${id} u fshi me sukses.`;
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Gabim gjatë fshirjes së postimit.';
        }
      });
  }

}