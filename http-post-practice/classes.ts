export {};

class Car {
  static totalCars = 0;

  protected id: number;
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

    Car.totalCars++;
  }

  getInfo(): string {
    return `${this.brand} ${this.model} - ${this.price} € / ditë`;
  }

  get dailyPrice(): number {
    return this.price;
  }

  set dailyPrice(newPrice: number) {
    if (newPrice <= 0) {
      throw new Error('Çmimi duhet të jetë më i madh se 0.');
    }

    this.price = newPrice;
  }

  getId(): number {
    return this.id;
  }

  static getTotalCars(): number {
    return Car.totalCars;
  }
}


class LuxuryCar extends Car {
  constructor(
    id: number,
    brand: string,
    model: string,
    price: number,
    public readonly luxuryLevel: string
  ) {
    super(id, brand, model, price);
  }

  getLuxuryInfo(): string {
    return `ID: ${this.id} - ${this.brand} ${this.model} - Luxury: ${this.luxuryLevel}`;
  }
}


abstract class Vehicle {
  constructor(
    public brand: string
  ) {}

  abstract getDescription(): string;
}


class RentCar extends Vehicle {
  getDescription(): string {
    return `Makina me qera: ${this.brand}`;
  }
}


// Car 1
const car1 = new Car(
  1,
  'BMW',
  'X5',
  80
);

console.log(car1.getInfo());
console.log(car1.dailyPrice);
console.log(car1.getId());


// Ndryshojmë çmimin përmes setter-it
car1.dailyPrice = 100;

console.log(car1.dailyPrice);
console.log(car1.getInfo());


// Car 2
const car2 = new Car(
  2,
  'Audi',
  'Q7',
  90
);

console.log(car2.getInfo());
console.log(car2.dailyPrice);
console.log(car2.getId());


// Luxury Car
const luxuryCar = new LuxuryCar(
  3,
  'Mercedes',
  'G-Class',
  150,
  'Premium'
);

console.log(luxuryCar.getInfo());
console.log(luxuryCar.getLuxuryInfo());
console.log(luxuryCar.dailyPrice);
console.log(luxuryCar.getId());


// Static method
console.log('Total cars:', Car.getTotalCars());


// Rent Car
const rentCar = new RentCar('BMW');

console.log(rentCar.getDescription());