import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
})
export class About {

  private route = inject(ActivatedRoute);

  title = '';

  description = '';

  ngOnInit() {

    this.title =
      this.route.snapshot.data['title'];

    this.description =
      this.route.snapshot.data['description'];

  }

}