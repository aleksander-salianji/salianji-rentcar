import { Component, inject } from '@angular/core';
import { Router } from '@angular/router'
import { CanComponentDeactivate } from '../can-component-deactivate';

@Component({
  selector: 'app-booking',
  imports: [],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements CanComponentDeactivate {

  private router = inject(Router);

  // Tregon nese perdoruesi ka bere ndryshime
  hasUnsavedChanges = false;

  // Ekzekutohet sa here perdoruesi shkruan
  // ose ndyshon me nje input
  onInput() {
    this.hasUnsavedChanges = true;
  }

  // Navigimi programatik drejt Cars
  goToCars() {
  this.router.navigate(['/cars'], {
    replaceUrl: true
  });
}

  // Metoda qe perdoret per CanDeactivate Guard
  canDeactivate(): boolean {

    // Nese nuk ka ndyshime,
    // lejon perdoruesin te largohet
    if (!this.hasUnsavedChanges) {
      return true;
    }

    // Nese ka ndryshime,
    // pyesim perdoruesin
    return (globalThis as any).confirm(
      'Ke ndryshime të paruajtura. A je i sigurt që dëshiron të largohesh?'
    );
  }
}