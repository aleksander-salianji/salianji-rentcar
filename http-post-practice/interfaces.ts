export {};


// ========================================
// 1. INTERFACE CarData
// ========================================

interface CarData {
  id: number;
  brand: string;
  model: string;
  price: number;
}


// ========================================
// 2. CLASS Car implements CarData
// ========================================

class Car implements CarData {

  id: number;
  brand: string;
  model: string;
  price: number;

  constructor(
    id: number,
    brand: string,
    model: string,
    price: number
  ) {
    this.id = id;
    this.brand = brand;
    this.model = model;
    this.price = price;
  }

  getInfo(): string {
    return `${this.brand} ${this.model} - ${this.price} € / ditë`;
  }
}


// ========================================
// 3. Krijojmë Car
// ========================================

const car1 = new Car(
  1,
  'BMW',
  'X5',
  80
);

const car2 = new Car(
  2,
  'Audi',
  'Q7',
  90
);


console.log(car1);
console.log(car1.getInfo());

console.log(car2);
console.log(car2.getInfo());



// ========================================
// 4. INTERFACE RentalCarData
// ========================================

interface RentalCarData {

  readonly id: number;

  brand: string;

  model: string;

  price: number;

  getInfo(): string;
}


// ========================================
// 5. CLASS RentalCar implements RentalCarData
// ========================================

class RentalCar implements RentalCarData {

  readonly id: number;

  brand: string;

  model: string;

  price: number;

  constructor(
    id: number,
    brand: string,
    model: string,
    price: number
  ) {
    this.id = id;
    this.brand = brand;
    this.model = model;
    this.price = price;
  }

  getInfo(): string {
    return `${this.brand} ${this.model} - ${this.price} € / ditë`;
  }
}


// ========================================
// 6. Krijojmë RentalCar
// ========================================

const rentalCar = new RentalCar(
  10,
  'Mercedes',
  'G-Class',
  150
);


console.log(rentalCar);
console.log(rentalCar.getInfo());



// ========================================
// 7. INTERFACE VehicleData
// ========================================

interface VehicleData {

  readonly id: number;

  brand: string;

  model: string;

  price: number;
}


// ========================================
// 8. CLASS PremiumCar implements VehicleData
// ========================================

class PremiumCar implements VehicleData {

  readonly id: number;

  brand: string;

  model: string;

  price: number;

  constructor(
    id: number,
    brand: string,
    model: string,
    price: number
  ) {
    this.id = id;
    this.brand = brand;
    this.model = model;
    this.price = price;
  }

  getInfo(): string {
    return `${this.brand} ${this.model} - ${this.price} € / ditë`;
  }

  getPremiumPrice(days: number): number {
    return this.price * days;
  }
}


// ========================================
// 9. Krijojmë PremiumCar
// ========================================

const premiumCar = new PremiumCar(
  20,
  'BMW',
  'X5',
  100
);


console.log(premiumCar.getInfo());

console.log(
  `Çmimi për 5 ditë: ${premiumCar.getPremiumPrice(5)} €`
);



// ========================================
// 10. MULTIPLE INTERFACES
// ========================================

interface GPS {
  hasGPS: boolean;
}


interface Insurance {
  insurancePrice: number;
}


// ========================================
// 11. FullCar implements 3 interfaces
// ========================================

class FullCar implements VehicleData, GPS, Insurance {

  readonly id: number;

  brand: string;

  model: string;

  price: number;

  hasGPS: boolean;

  insurancePrice: number;


  constructor(
    id: number,
    brand: string,
    model: string,
    price: number,
    hasGPS: boolean,
    insurancePrice: number
  ) {
    this.id = id;
    this.brand = brand;
    this.model = model;
    this.price = price;
    this.hasGPS = hasGPS;
    this.insurancePrice = insurancePrice;
  }


  getInfo(): string {
    return `${this.brand} ${this.model} - ${this.price} € / ditë`;
  }


  getTotalPrice(days: number): number {
    return this.price * days + this.insurancePrice;
  }
}


// ========================================
// 12. Krijojmë FullCar
// ========================================

const fullCar = new FullCar(
  30,
  'Audi',
  'Q7',
  90,
  true,
  20
);


console.log(fullCar.getInfo());

console.log(
  'GPS:',
  fullCar.hasGPS
);

console.log(
  'Çmimi total:',
  fullCar.getTotalPrice(5),
  '€'
);



// ========================================
// 13. INTERFACE SI TIP PËR ARRAY
// ========================================

const cars: CarData[] = [

  {
    id: 1,
    brand: 'BMW',
    model: 'X5',
    price: 80
  },

  {
    id: 2,
    brand: 'Audi',
    model: 'Q7',
    price: 90
  },

  {
    id: 3,
    brand: 'Mercedes',
    model: 'G-Class',
    price: 150
  }

];


console.log('Lista e makinave:');


for (const car of cars) {

  console.log(
    `${car.id} - ${car.brand} ${car.model} - ${car.price} € / ditë`
  );

}



// ========================================
// 14. INTERFACE SI PARAMETËR FUNKSIONI
// ========================================

function printCar(car: CarData): void {

  console.log(
    `Makina: ${car.brand} ${car.model} - ${car.price} € / ditë`
  );

}


printCar(car1);

printCar(car2);

printCar(fullCar);