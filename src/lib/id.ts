// A plain crypto.randomUUID() (not a prefixed id) so every locally-created
// record can be written straight into Supabase's uuid primary key columns
// with no id translation between the local reducer and the database.
export function makeId(): string {
  return crypto.randomUUID();
}

// Local calendar date (not UTC) so the day rolls over at the family's
// midnight rather than at 02:00/03:00 Israel time.
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
