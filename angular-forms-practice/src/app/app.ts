import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  userForm = new FormGroup(
    {

      // EMRI
      name: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(3),
          this.forbiddenNameValidator
        ]
      ),

      // EMAIL
      email: new FormControl(
        '',
        [
          Validators.required,
          Validators.email
        ],
        [
          this.emailTakenValidator
        ]
      ),

      // MBIEMRI
      surname: new FormControl(''),

      // TELEFONI
      phone: new FormControl(''),

      // PASSWORD
      password: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ),

      // CONFIRM PASSWORD
      confirmPassword: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      // ADRESA
      address: new FormGroup({

        street: new FormControl(''),

        city: new FormControl(''),

        zipCode: new FormControl('')

      }),

      // FORM ARRAY
      phoneNumbers: new FormArray([

        new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(10)
          ]
        )

      ])

    },

    {
      validators: this.passwordMatchValidator
    }

  );


  submittedName = '';
  submittedEmail = '';


  // CUSTOM NAME VALIDATOR

  forbiddenNameValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const value = control.value;

    if (
      value &&
      value.toLowerCase().includes('test')
    ) {

      return {
        forbiddenName: true
      };

    }

    return null;
  }


  // ASYNC EMAIL VALIDATOR

  emailTakenValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {

    const value = control.value;

    if (value === 'test@gmail.com') {

      return of({
        emailTaken: true
      }).pipe(
        delay(1000)
      );

    }

    return of(null).pipe(
      delay(1000)
    );

  }


  // FORM GROUP VALIDATOR
  // Kontrollon Password dhe Confirm Password

  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {

      return {
        passwordMismatch: true
      };

    }

    return null;
  }


  // SUBMIT

  onSubmit() {

    this.submittedName =
      this.userForm.value.name ?? '';

    this.submittedEmail =
      this.userForm.value.email ?? '';

  }


  // PATCH VALUE

  fillForm() {

    this.userForm.patchValue({

      name: 'Aleksander',

      email: 'aleksandersalianji@icloud.com'

    });

  }


  // SET VALUE

  setForm() {

    this.userForm.setValue({

      name: 'Aleksander',

      email: 'aleksandersalianji@icloud.com',

      surname: 'Salianji',

      phone: '0690000000',

      password: '123456',

      confirmPassword: '123456',

      address: {

        street: 'Rruga e Elbasanit',

        city: 'Tirane',

        zipCode: '1001'

      },

      phoneNumbers: [

        '0690000000'

      ]

    });

  }


  // RESET

  resetForm() {

    this.userForm.reset();

    this.submittedName = '';

    this.submittedEmail = '';

  }


  // TEST DATA

  fillTestData() {

    this.userForm.patchValue({

      name: 'Aleksander',

      email: 'aleksandersalianji@icloud.com'

    });

  }


  // GET FORM ARRAY

  get phoneNumbers() {

    return this.userForm.controls.phoneNumbers;

  }


  // ADD PHONE

  addPhone() {

    this.phoneNumbers.push(

      new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      )

    );

  }


  // REMOVE PHONE

  removePhone(index: number) {

    this.phoneNumbers.removeAt(index);

  }

}