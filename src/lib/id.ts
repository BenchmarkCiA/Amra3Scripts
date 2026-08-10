export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
