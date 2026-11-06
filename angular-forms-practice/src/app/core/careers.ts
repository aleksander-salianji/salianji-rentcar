// Pozicionet e hapura te faqja /karriera.
// SHEMBUJ — ndryshoji, fshiji ose shto të tjerë këtu.
export interface Job {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
  tasks: string[];
  requirements: string[];
}

export const OPEN_JOBS: Job[] = [
  {
    id: 'support',
    title: 'Agjent/e Support-i për Klientët',
    team: 'Support',
    location: 'Tiranë',
    type: 'Full-time · me turne',
    summary: 'Je zëri i Bookers për klientët: ndihmon me rezervimet, anulimet dhe çdo problem gjatë udhëtimit.',
    tasks: [
      'Përgjigjesh në telefon, WhatsApp dhe email',
      'Ndjek kërkesat te paneli i support-it deri në zgjidhje',
      'Koordinon me kompanitë partnere për ndryshime rezervimesh'
    ],
    requirements: [
      'Shqip dhe anglisht shumë mirë (italishtja është plus)',
      'Durim dhe qetësi me klientët',
      'Gatishmëri për turne, edhe në fundjavë gjatë sezonit'
    ]
  },
  {
    id: 'partner',
    title: 'Menaxher/e Partneritetesh',
    team: 'Biznesi',
    location: 'Tiranë · udhëtime në Durrës, Vlorë, Sarandë',
    type: 'Full-time',
    summary: 'Sjell kompani të reja qiraje në platformë dhe kujdesesh që partnerët ekzistues të rriten me ne.',
    tasks: [
      'Takon kompanitë e qirasë dhe prezanton platformën',
      'Ndihmon partnerët e rinj me makinat, fotot dhe çmimet',
      'Ndjek rezultatet e çdo partneri çdo muaj'
    ],
    requirements: [
      'Përvojë në shitje ose menaxhim klientësh',
      'Patentë B dhe gatishmëri për udhëtime',
      'Njohja e tregut të turizmit është plus'
    ]
  },
  {
    id: 'frontend',
    title: 'Zhvillues/e Frontend (Angular)',
    team: 'Teknologji',
    location: 'Tiranë · hibrid',
    type: 'Full-time',
    summary: 'Ndërton faqen që përdorin mijëra udhëtarë dhe panelin e bizneseve partnere.',
    tasks: [
      'Zhvillon faqe të reja me Angular dhe TypeScript',
      'Përmirëson shpejtësinë dhe përvojën në telefon',
      'Bashkëpunon me backend-in (Spring Boot)'
    ],
    requirements: [
      'Angular, TypeScript, HTML/CSS',
      'Reactive Forms dhe RxJS',
      'Git dhe punë në ekip'
    ]
  },
  {
    id: 'marketing',
    title: 'Praktikant/e Marketingu Digjital',
    team: 'Marketing',
    location: 'Tiranë',
    type: 'Praktikë · 3 muaj',
    summary: 'Krijon përmbajtje për blogun dhe rrjetet sociale dhe mëson marketingun e një platforme online.',
    tasks: [
      'Shkruan artikuj për blogun (itinerare, këshilla)',
      'Përgatit postime për Instagram dhe TikTok',
      'Ndjek rezultatet e fushatave'
    ],
    requirements: [
      'Student/e ose i/e diplomuar së fundmi',
      'Shkrim i mirë në shqip',
      'Pasion për udhëtimet dhe fotografinë'
    ]
  }
];
