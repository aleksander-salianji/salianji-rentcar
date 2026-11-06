import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CarService } from '../../core/car.service';
import { errorMessage } from '../../core/http-error';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  FUELS,
  FUEL_LABELS,
  TRANSMISSIONS,
  TRANSMISSION_LABELS
} from '../../core/labels';
import { Car, CarCategory, CarRequest, FuelType, Transmission } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';

const CURRENT_YEAR = new Date().getFullYear();

@Component({
  selector: 'app-admin-cars',
  imports: [ReactiveFormsModule, DecimalPipe, LabelPipe],
  templateUrl: './admin-cars.html',
  styles: `
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 20px;
      align-items: start;
    }
    .car-form { position: sticky; top: 88px; }
    .car-form h2 { font-size: 1.15rem; }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    tr.inactive td { color: var(--muted); }
    .mt { margin-top: 12px; }
    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .car-form { position: static; }
    }
  `
})
export class AdminCars {

  private carService = inject(CarService);

  readonly currentYear = CURRENT_YEAR;
  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly transmissions = TRANSMISSIONS;
  readonly transmissionLabels = TRANSMISSION_LABELS;
  readonly fuels = FUELS;
  readonly fuelLabels = FUEL_LABELS;

  cars = signal<Car[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  form = new FormGroup({
    brand: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }),
    model: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    year: new FormControl<number | null>(CURRENT_YEAR, [
      Validators.required,
      Validators.min(2000),
      Validators.max(CURRENT_YEAR + 1)
    ]),
    category: new FormControl<CarCategory>('ECONOMY', { nonNullable: true }),
    transmission: new FormControl<Transmission>('MANUAL', { nonNullable: true }),
    fuel: new FormControl<FuelType>('PETROL', { nonNullable: true }),
    seats: new FormControl<number | null>(5, [Validators.required, Validators.min(2), Validators.max(9)]),
    pricePerDay: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
    imageUrl: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^(https?:\/\/.+)?$/)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(300)] }),
    active: new FormControl(true, { nonNullable: true })
  });

  constructor() {
    this.load();
  }

  load() {
    this.carService.adminList().subscribe({
      next: cars => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  isInvalid(name: keyof CarRequest): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }


  // SET VALUE: plotëson TË GJITHA fushat e formës me të dhënat e makinës
  edit(car: Car) {
    this.editingId.set(car.id);
    this.formError.set(null);
    this.form.setValue({
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      transmission: car.transmission,
      fuel: car.fuel,
      seats: car.seats,
      pricePerDay: car.pricePerDay,
      imageUrl: car.imageUrl ?? '',
      description: car.description ?? '',
      active: car.active
    });
  }

  // RESET: kthen formën në vlerat fillestare për një makinë të re
  newCar() {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({ year: CURRENT_YEAR, seats: 5, pricePerDay: null });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const request: CarRequest = {
      brand: v.brand.trim(),
      model: v.model.trim(),
      year: v.year ?? CURRENT_YEAR,
      category: v.category,
      transmission: v.transmission,
      fuel: v.fuel,
      seats: v.seats ?? 5,
      pricePerDay: v.pricePerDay ?? 0,
      imageUrl: v.imageUrl.trim() || null,
      description: v.description.trim() || null,
      active: v.active
    };

    const id = this.editingId();
    const call = id === null
      ? this.carService.create(request)
      : this.carService.update(id, request);

    this.saving.set(true);
    this.formError.set(null);

    call.subscribe({
      next: saved => {
        this.saving.set(false);
        this.cars.update(list =>
          id === null ? [...list, saved] : list.map(c => (c.id === saved.id ? saved : c))
        );
        this.flash(id === null ? 'Makina u shtua.' : 'Ndryshimet u ruajtën.');
        this.newCar();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(errorMessage(err));
      }
    });
  }

  toggleActive(car: Car) {
    const { id, ...rest } = car;
    this.carService.update(id, { ...rest, active: !car.active }).subscribe({
      next: saved => {
        this.cars.update(list => list.map(c => (c.id === saved.id ? saved : c)));
        this.flash(saved.active ? 'Makina u aktivizua.' : 'Makina u çaktivizua. Nuk shfaqet më te klientët.');
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  remove(car: Car) {
    if (!confirm(`Të fshihet ${car.brand} ${car.model}? Ky veprim nuk kthehet.`)) {
      return;
    }
    this.error.set(null);
    this.carService.remove(car.id).subscribe({
      next: () => {
        this.cars.update(list => list.filter(c => c.id !== car.id));
        if (this.editingId() === car.id) {
          this.newCar();
        }
        this.flash('Makina u fshi.');
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  private flash(text: string) {
    this.message.set(text);
    setTimeout(() => {
      if (this.message() === text) {
        this.message.set(null);
      }
    }, 3500);
  }
}
