# Salianji Rent Car — Backend (Spring Boot + MySQL)

## Çfarë të duhet

- **JDK 17 ose më i ri.** IntelliJ mund ta shkarkojë: File → Project Structure → SDK → Download JDK.
- **MySQL** në portën 3306. Mënyra më e lehtë është **XAMPP**: hap XAMPP Control Panel dhe shtyp **Start** te MySQL.

## Fjalëkalimi i MySQL

Te `src/main/resources/application.properties`:

```properties
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

- **XAMPP:** lëre siç është (root pa fjalëkalim).
- **MySQL Installer** (me fjalëkalim): vendos fjalëkalimin pas `:`, p.sh. `${DB_PASSWORD:fjalekalimi_yt}`.

Databaza `salianji_rentcar` dhe tabelat krijohen automatikisht.

## Si ta nisësh

### Me IntelliJ (rekomandohet)

1. Te paneli i majtë, klik i djathtë mbi `backend/pom.xml` → **Add as Maven Project**.
   Prit derisa IntelliJ të shkarkojë libraritë (shiriti poshtë djathtas).
2. Hap `src/main/java/com/salianji/rentcar/RentCarApplication.java`.
3. Kliko shigjetën e gjelbër ▶ pranë `main` → **Run**.

Kur sheh në konsolë `Started RentCarApplication`, serveri punon te `http://localhost:8080`.

### Me terminal (nëse ke Maven të instaluar)

```
cd backend
mvn spring-boot:run
```

## Provë e shpejtë

Hap në shfletues: http://localhost:8080/api/cars

Duhet të shohësh listën e 8 makinave në JSON.

## Lidhja me frontend-in

Te `angular-forms-practice/src/app/core/config.ts` ndrysho:

```ts
export const USE_MOCK_API = false;
```

Pastaj rinise `ng serve`. Tani frontend-i përdor backend-in dhe databazën MySQL.

## Llogaria e adminit

Krijohet automatikisht herën e parë:

- Email: `admin@salianjirent.al`
- Fjalëkalimi: `Admin123`

Llogaria demo e klientit **nuk** ekziston në backend. Krijo një llogari të re te **Regjistrohu**.

## Struktura

```
src/main/java/com/salianji/rentcar/
├── RentCarApplication.java     → pika e nisjes
├── config/DataSeeder.java      → admini dhe makinat fillestare
├── model/                      → @Entity: User, Car, Booking + enum-et
├── repository/                 → Spring Data JPA (pyetjet në databazë)
├── dto/                        → objektet JSON që hyjnë/dalin + validimi
├── service/                    → logjika e biznesit, çmimi, rregullat
├── controller/                 → REST endpoints (/api/...)
├── security/                   → JWT, filtri, SecurityConfig, CORS
└── exception/                  → gabimet si JSON { "message": "..." }
```

## Tabelat në MySQL

| Tabela                 | Përmbajtja                                |
|------------------------|-------------------------------------------|
| users                  | përdoruesit (fjalëkalimi me BCrypt)       |
| cars                   | makinat                                   |
| bookings               | rezervimet, me adresën, shtesat, çmimet   |
| booking_phone_numbers  | numrat e telefonit të çdo rezervimi       |

## Siguria

- Fjalëkalimet ruhen të enkriptuara me **BCrypt**, kurrë si tekst.
- Login kthen një **JWT** që vlen 24 orë. Frontend-i e dërgon te çdo kërkesë.
- `/api/admin/**` lejohet vetëm për rolin **ADMIN**.
- Çmimi llogaritet **në server**, jo në frontend.
- Kur dy klientë rezervojnë njëkohësisht të njëjtën makinë, rreshti i makinës bllokohet, kështu që vetëm njëri rezervim kalon.
