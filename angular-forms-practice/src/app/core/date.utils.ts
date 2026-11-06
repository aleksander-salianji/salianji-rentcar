// Kthen datën në formatin YYYY-MM-DD sipas orës lokale (jo UTC)
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Numri i ditëve midis dy datave YYYY-MM-DD (0 nëse mungon njëra ose renditja është gabim)
export function daysBetween(from?: string | null, to?: string | null): number {
  if (!from || !to) {
    return 0;
  }
  const start = Date.parse(from + 'T00:00:00Z');
  const end = Date.parse(to + 'T00:00:00Z');
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 0;
  }
  const diff = Math.round((end - start) / 86_400_000);
  return diff > 0 ? diff : 0;
}

// Dy periudha mbivendosen? Dita e kthimit nuk llogaritet,
// pra makina e kthyer më 10 mund të merret përsëri më 10.
export function periodsOverlap(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
