import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BookingService } from '../../core/booking.service';
import { CarService } from '../../core/car.service';
import { addDays, periodsOverlap, toISODate, todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import { imageSrc } from '../../core/images';
import { EXTRAS_OPTIONS, LOCATIONS, RENTAL_RULES } from '../../core/labels';
import { BookedPeriod, BookingRequest, Car } from '../../core/models';
import { calculatePrice } from '../../core/pricing';
import {
  dateRangeValidator,
  LICENSE_PATTERN,
  notInPastValidator,
  PHONE_PATTERN
} from '../../core/validators';
import { LabelPipe } from '../../shared/label.pipe';

const MAX_PHONES = 3;

@Component({
  selector: 'app-booking',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, DatePipe, LabelPipe],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class BookingPage implements OnInit {

  private carService = inject(CarService);
  private bookingService = inject(BookingService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Parametri nga URL-ja: /rezervo/:carId
  readonly carId = input.required<string>();
  // datat nga kërkimi: /rezervo/3?nga=2026-11-10&deri=2026-11-14
  readonly nga = input<string>();
  readonly deri = input<string>();
  // vendet nga kërkimi: ?marrja=Aeroporti Rinas&kthimi=Durrës
  readonly marrja = input<string>();
  readonly kthimi = input<string>();

  readonly today = todayISO();
  readonly locations = LOCATIONS;
  readonly extrasOptions = EXTRAS_OPTIONS;
  readonly rules = RENTAL_RULES;
  readonly maxPhones = MAX_PHONES;
  readonly imageSrc = imageSrc;

  car = signal<Car | null>(null);
  bookedPeriods = signal<BookedPeriod[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);

  submitting = signal(false);
  submitAttempted = signal(false);
  submitError = signal<string | null>(null);


  // Validator në nivel të gjithë formës:
  // datat e zgjedhura nuk duhet të mbivendosen me rezervimet ekzistuese të makinës
  private availabilityValidator = (form: AbstractControl): ValidationErrors | null => {
    const from = form.get('rental.pickupDate')?.value as string;
    const to = form.get('rental.returnDate')?.value as string;

    if (!from || !to || to <= from) {
      return null;
    }
    const taken = this.bookedPeriods().some(p =>
      periodsOverlap(from, to, p.pickupDate, p.returnDate)
    );
    return taken ? { carUnavailable: true } : null;
  };


  // ================= FORMA =================

  form = new FormGroup(
    {
      // QIRAJA — me validator në nivel grupi për datat
      rental: new FormGroup(
        {
          pickupLocation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          returnLocation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          pickupDate: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, notInPastValidator]
          }),
          returnDate: new FormControl('', { nonNullable: true, validators: [Validators.required] })
        },
        { validators: dateRangeValidator(RENTAL_RULES.minDays, RENTAL_RULES.maxDays) }
      ),

      // SHOFERI (klienti rezervon pa llogari)
      driver: new FormGroup({
        firstName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.maxLength(50)]
        }),
        lastName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.maxLength(50)]
        }),
        email: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email, Validators.maxLength(120)]
        }),
        age: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(RENTAL_RULES.minDriverAge),
          Validators.max(RENTAL_RULES.maxDriverAge)
        ]),
        licenseNumber: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.pattern(LICENSE_PATTERN)]
        })
      }),

      // ADRESA
      address: new FormGroup({
        street: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        zipCode: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\d{4}$/)] })
      }),

      // FORM ARRAY — 1 deri në 3 numra telefoni
      phoneNumbers: new FormArray([this.createPhoneControl()]),

      // SHTESAT
      extras: new FormGroup({
        gps: new FormControl(false, { nonNullable: true }),
        childSeat: new FormControl(false, { nonNullable: true }),
        fullInsurance: new FormControl(false, { nonNullable: true })
      }),

      acceptTerms: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue]
      })
    },
    { validators: this.availabilityValidator }
  );

  // Vlera e formës si signal → çmimi rillogaritet automatikisht
  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  price = computed(() => {
    const v = this.formValue();
    return calculatePrice(
      this.car()?.pricePerDay ?? 0,
      v.rental?.pickupDate,
      v.rental?.returnDate,
      v.extras
    );
  });


  constructor() {
    // Rifreskon ekranin kur ndryshon statusi i formës
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit() {
    const id = Number(this.carId());

    if (!Number.isInteger(id) || id <= 0) {
      this.loadError.set('Makina nuk u gjet.');
      this.loading.set(false);
      return;
    }

    this.carService.get(id).subscribe({
      next: car => {
        this.car.set(car);
        this.loading.set(false);
      },
      error: err => {
        this.loadError.set(errorMessage(err, 'Makina nuk u gjet.'));
        this.loading.set(false);
      }
    });

    this.loadBookedPeriods(id);

    // PATCH VALUE: datat që klienti zgjodhi te kërkimi
    const from = this.nga();
    const to = this.deri();
    if (from && to && from >= this.today && to > from) {
      this.form.controls.rental.patchValue({ pickupDate: from, returnDate: to });
    }

    // PATCH VALUE: vendi i marrjes / kthimit nga kërkimi
    const pickup = this.marrja();
    const dropoff = this.kthimi();
    if (pickup && LOCATIONS.includes(pickup)) {
      this.form.controls.rental.patchValue({ pickupLocation: pickup });
    }
    if (dropoff && LOCATIONS.includes(dropoff)) {
      this.form.controls.rental.patchValue({ returnLocation: dropoff });
    }
  }


  // ================= NDIHMËS PËR TEMPLATE =================

  get phoneNumbers() {
    return this.form.controls.phoneNumbers;
  }

  isInvalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  hasError(path: string, code: string): boolean {
    return !!this.form.get(path)?.hasError(code);
  }

  // A janë prekur të dyja datat (për të treguar gabimet e grupit)
  datesTouched(): boolean {
    const r = this.form.controls.rental.controls;
    return r.pickupDate.touched && r.returnDate.touched;
  }

  // Data e kthimit duhet të jetë të paktën minDays pas marrjes
  minReturnDate(): string {
    const pickup = this.form.controls.rental.controls.pickupDate.value || this.today;
    return toISODate(addDays(new Date(pickup + 'T00:00:00'), RENTAL_RULES.minDays));
  }


  // ================= VEPRIMET =================

  addPhone() {
    if (this.phoneNumbers.length < MAX_PHONES) {
      this.phoneNumbers.push(this.createPhoneControl());
    }
  }

  removePhone(index: number) {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  // Merr vendin e marrjes edhe si vend kthimi
  sameReturnLocation() {
    const pickup = this.form.controls.rental.controls.pickupLocation.value;
    if (pickup) {
      this.form.controls.rental.controls.returnLocation.setValue(pickup);
    }
  }

  resetForm() {
    this.phoneNumbers.clear();
    this.phoneNumbers.push(this.createPhoneControl());
    this.form.reset();
    this.submitAttempted.set(false);
    this.submitError.set(null);
  }

  onSubmit() {
    this.submitAttempted.set(true);
    this.submitError.set(null);

    const car = this.car();
    if (!car || this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const request: BookingRequest = {
      carId: car.id,
      firstName: v.driver.firstName.trim(),
      lastName: v.driver.lastName.trim(),
      email: v.driver.email.trim(),
      pickupLocation: v.rental.pickupLocation,
      returnLocation: v.rental.returnLocation,
      pickupDate: v.rental.pickupDate,
      returnDate: v.rental.returnDate,
      driverAge: v.driver.age ?? 0,
      licenseNumber: v.driver.licenseNumber.trim().toUpperCase(),
      phoneNumbers: v.phoneNumbers.map(p => p.trim()),
      address: {
        street: v.address.street.trim(),
        city: v.address.city.trim(),
        zipCode: v.address.zipCode.trim()
      },
      extras: v.extras
    };

    this.submitting.set(true);

    this.bookingService.create(request).subscribe({
      next: booking => {
        this.submitting.set(false);
        // rezervimi kalon te faqja "Rezervimi im" pa e kërkuar përsëri
        this.router.navigate(['/rezervimi'], { queryParams: { sukses: booking.code }, state: { booking } });
      },
      error: err => {
        this.submitting.set(false);
        this.submitError.set(errorMessage(err));
        // nëse makina u zu ndërkohë nga dikush tjetër, rifresko periudhat
        this.loadBookedPeriods(car.id);
      }
    });
  }


  // ================= PRIVATE =================

  private createPhoneControl(): FormControl<string> {
    return new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PHONE_PATTERN)]
    });
  }

  private loadBookedPeriods(carId: number) {
    this.carService.bookedPeriods(carId).subscribe({
      next: periods => {
        this.bookedPeriods.set(periods);
        // rikontrollo disponueshmërinë me periudhat e reja
        this.form.updateValueAndValidity();
      }
    });
  }
}
