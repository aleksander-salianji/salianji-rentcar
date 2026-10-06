export {};

interface CarData {
  id: number;
  brand: string;
  model: string;
  price: number;
}

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

interface RentalCarData {
  readonly id: number;
  brand: string;
  model: string;
  price: number;

  getInfo(): string;
}

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

const rentalCar = new RentalCar(
  10,
  'Mercedes',
  'G-Class',
  150
);

console.log(rentalCar);
console.log(rentalCar.getInfo());

interface VehicleData {
  readonly id: number;
  brand: string;
  model: string;
  price: number;
}

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