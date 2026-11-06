import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CarService } from '../../core/car.service';
import { CompanyService } from '../../core/company.service';
import { errorMessage } from '../../core/http-error';
import { imageSrc, resizeImage } from '../../core/images';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  FUELS,
  FUEL_LABELS,
  TRANSMISSIONS,
  TRANSMISSION_LABELS
} from '../../core/labels';
import { AdminCompany, Car, CarCategory, CarRequest, FuelType, Transmission } from '../../core/models';
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
    tr.inactive .thumb { opacity: .5; }
    .thumb-cell { width: 72px; }
    .thumb {
      display: grid;
      place-items: center;
      width: 64px;
      height: 44px;
      border-radius: 6px;
      object-fit: cover;
      background: var(--bg);
    }
    .thumb-empty { font-size: 1.1rem; opacity: .5; }
    .photo-box {
      overflow: hidden;
      aspect-ratio: 16 / 9;
      border: 1px dashed var(--border);
      border-radius: 10px;
      background: var(--bg);
    }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    .photo-empty {
      display: grid;
      place-items: center;
      height: 100%;
      color: var(--muted);
      font-size: .9rem;
    }
    .photo-actions { display: flex; gap: 8px; margin-top: 8px; }
    .photo-actions label { cursor: pointer; }
    .head-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .head-actions select { width: auto; }
    .company-name { color: var(--accent); font-weight: 600; }
    .mt { margin-top: 12px; }
    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .car-form { position: static; }
    }
  `
})
export class AdminCars {

  private carService = inject(CarService);
  private companyService = inject(CompanyService);

  // ?kompania=2 (nga faqja e kompanive)
  readonly kompania = input<string>();
  companies = signal<AdminCompany[]>([]);
  companyFilter = signal<number>(0);

  shownCars = computed(() => {
    const f = this.companyFilter() || Number(this.kompania()) || 0;
    return f ? this.cars().filter(c => c.companyId === f) : this.cars();
  });

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

  // ---------- FOTO ----------
  photoFile = signal<File | null>(null);       // foto e re e zgjedhur, ende pa u ngarkuar
  photoPreview = signal<string | null>(null);  // çfarë shfaqet në formë
  removePhoto = signal(false);                 // admini kërkoi ta heqë foton
  readonly imageSrc = imageSrc;

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
    // foto menaxhohet me ngarkim (shih më poshtë); këtu ruhet vetëm adresa aktuale
    imageUrl: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(300)] }),
    active: new FormControl(true, { nonNullable: true }),
    companyId: new FormControl<number | null>(null, [Validators.required])
  });

  constructor() {
    this.load();
    this.companyService.adminList().subscribe({
      next: list => {
        this.companies.set(list);
        // për makinë të re, zgjidh kompaninë e filtrit ose të parën
        if (this.form.controls.companyId.value === null && list.length) {
          this.form.controls.companyId.setValue(Number(this.kompania()) || list[0].id);
        }
      }
    });
  }

  setCompanyFilter(value: string) {
    this.companyFilter.set(Number(value) || 0);
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
    this.resetPhoto(imageSrc(car.imageUrl));
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
      active: car.active,
      companyId: car.companyId
    });
  }

  // RESET: kthen formën në vlerat fillestare për një makinë të re
  newCar() {
    this.editingId.set(null);
    this.formError.set(null);
    this.resetPhoto(null);
    this.form.reset({
      year: CURRENT_YEAR,
      seats: 5,
      pricePerDay: null,
      companyId: this.companyFilter() || Number(this.kompania()) || this.companies()[0]?.id || null
    });
  }

  // ---------- FOTO ----------

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';               // lejon të zgjidhet përsëri e njëjta foto
    if (!file) {
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      this.formError.set('Zgjidh një foto JPG, PNG ose WEBP.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.formError.set('Foto është shumë e madhe (maksimumi 20 MB).');
      return;
    }
    this.formError.set(null);
    this.revokePreview();
    this.photoFile.set(file);
    this.photoPreview.set(URL.createObjectURL(file));
    this.removePhoto.set(false);
  }

  clearPhoto() {
    this.revokePreview();
    this.photoFile.set(null);
    this.photoPreview.set(null);
    this.removePhoto.set(this.editingId() !== null);
  }

  private resetPhoto(preview: string | null) {
    this.revokePreview();
    this.photoFile.set(null);
    this.photoPreview.set(preview);
    this.removePhoto.set(false);
  }

  private revokePreview() {
    const current = this.photoPreview();
    if (current?.startsWith('blob:')) {
      URL.revokeObjectURL(current);
    }
  }


  // ---------- RUAJTJA ----------

  async save() {
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
      active: v.active,
      companyId: v.companyId
    };

    const id = this.editingId();
    this.saving.set(true);
    this.formError.set(null);

    try {
      // 1. ruaj të dhënat e makinës
      let saved = await firstValueFrom(
        id === null ? this.carService.create(request) : this.carService.update(id, request)
      );

      // 2. ngarko foton e re (e zvogëluar) ose hiqe të vjetrën
      const file = this.photoFile();
      if (file) {
        const image = await resizeImage(file);
        saved = await firstValueFrom(this.carService.uploadImage(saved.id, image, 'foto.jpg'));
      } else if (this.removePhoto() && saved.imageUrl) {
        saved = await firstValueFrom(this.carService.removeImage(saved.id));
      }

      this.cars.update(list =>
        list.some(c => c.id === saved.id)
          ? list.map(c => (c.id === saved.id ? saved : c))
          : [...list, saved]
      );
      this.flash(id === null ? 'Makina u shtua.' : 'Ndryshimet u ruajtën.');
      this.newCar();
    } catch (err) {
      this.formError.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  toggleActive(car: Car) {
    const { id, companyName: _n, companyCity: _c, ...rest } = car;
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
