// A plain crypto.randomUUID() (not a prefixed id) so every locally-created
// record can be written straight into Supabase's uuid primary key columns
// with no id translation between the local reducer and the database.
export function makeId(): string {
  return crypto.randomUUID();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
