// Pyetjet e shpeshta. Teksti është te public/i18n/<gjuha>.json → "faq.groups"
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}
