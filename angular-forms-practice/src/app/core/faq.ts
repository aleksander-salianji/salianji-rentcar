import { RENTAL_RULES } from './labels';

// Pyetjet e shpeshta — përdoren te faqja /pyetje dhe te Ndihma
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const R = RENTAL_RULES;

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Rezervimi',
    items: [
      { q: 'A më duhet llogari për të rezervuar?', a: 'Jo. Zgjidh makinën, plotëso të dhënat dhe merr një kod rezervimi. Me kodin dhe telefonin e gjen rezervimin te "Rezervimi im".' },
      { q: 'Sa ditë është qiraja minimale?', a: `Minimumi është ${R.minDays} ditë dhe maksimumi ${R.maxDays} ditë.` },
      { q: 'Kush ma konfirmon rezervimin?', a: 'Kompania që zotëron makinën. Ajo merr rezervimin menjëherë dhe të kontakton në telefon ose email.' },
      { q: 'Si e di që makina është e lirë?', a: 'Kur zgjedh datat te kërkimi, shfaqen vetëm makinat e lira. Te faqja e rezervimit sheh edhe datat kur makina është e zënë.' }
    ]
  },
  {
    title: 'Pagesa dhe çmimet',
    items: [
      { q: 'Kur dhe si paguaj?', a: 'Pagesa bëhet te kompania në momentin e marrjes së makinës. Çmimi që sheh në përmbledhje është totali final.' },
      { q: 'A ka zbritje për qira të gjatë?', a: `Po. Për ${R.longRentalDays} ditë e më shumë ke ${R.longRentalDiscount * 100}% zbritje automatikisht.` },
      { q: 'Çfarë përfshin çmimi?', a: 'Qiranë ditore dhe shtesat që zgjedh (GPS, karrige për fëmijë, sigurim i plotë). Karburanti nuk përfshihet.' }
    ]
  },
  {
    title: 'Anulimi dhe ndryshimet',
    items: [
      { q: 'Si e anuloj rezervimin?', a: `Te "Rezervimi im" shkruaj kodin dhe telefonin, pastaj kliko "Anulo". Anulimi falas lejohet vetëm brenda ${R.cancelWindowHours} orëve nga rezervimi dhe para ditës së marrjes.` },
      { q: 'Kaluan 24 orët, çfarë bëj?', a: 'Telefono direkt kompaninë (numri është te rezervimi) ose na shkruaj te faqja Ndihmë.' },
      { q: 'Si i ndryshoj datat?', a: 'Anuloje brenda 24 orëve dhe bëj një rezervim të ri, ose kontakto kompaninë.' }
    ]
  },
  {
    title: 'Marrja e makinës',
    items: [
      { q: 'Çfarë dokumentesh më duhen?', a: `Patentë e vlefshme dhe dokument identifikimi. Shoferi duhet të jetë ${R.minDriverAge}–${R.maxDriverAge} vjeç.` },
      { q: 'Ku e marr makinën?', a: 'Në vendin që zgjodhe në rezervim, p.sh. Aeroporti Rinas, Tiranë qendër, Durrës, Vlorë, Shkodër ose Sarandë.' },
      { q: 'A mund ta kthej në qytet tjetër?', a: 'Po, zgjidh vend tjetër kthimi gjatë rezervimit. Konfirmoje me kompaninë.' }
    ]
  },
  {
    title: 'Për bizneset',
    items: [
      { q: 'Si bëhet kompania ime partnere?', a: 'Na shkruaj te faqja Ndihmë me temën "Dua të bëhem partner". Ne shtojmë kompaninë dhe makinat, dhe të krijojmë login-in e panelit.' },
      { q: 'Çfarë sheh biznesi te paneli?', a: 'Rezervimet e veta, gjendjen e makinave (të lira / të zëna) dhe xhiron ditore, javore e mujore.' }
    ]
  }
];
