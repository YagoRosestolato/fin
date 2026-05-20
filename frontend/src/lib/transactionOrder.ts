const key = (month: number, year: number) => `tx-order-${year}-${month}`;

export function loadOrder(month: number, year: number): string[] {
  try {
    const raw = localStorage.getItem(key(month, year));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrder(month: number, year: number, ids: string[]) {
  try {
    localStorage.setItem(key(month, year), JSON.stringify(ids));
  } catch {}
}

export function applyOrder<T extends { id: string }>(
  items: T[],
  month: number,
  year: number,
): T[] {
  const order = loadOrder(month, year);
  if (order.length === 0) return items;

  const map = new Map(items.map(t => [t.id, t]));
  const sorted: T[] = [];

  // items que estão na ordem salva
  for (const id of order) {
    const item = map.get(id);
    if (item) {
      sorted.push(item);
      map.delete(id);
    }
  }
  // novos items (não estavam na ordem salva) vão para o início
  return [...map.values(), ...sorted];
}
