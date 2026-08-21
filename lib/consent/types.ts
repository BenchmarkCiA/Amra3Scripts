/** 'strict' = UK/EU opt-in required. 'notice' = US notice-at-collection. */
export type ConsentMode = "strict" | "notice"

export interface ConsentCategories {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export interface ConsentRecord {
  version: string
  mode: ConsentMode
  categories: ConsentCategories
  gpc: boolean
  timestamp: number
}

export interface ConsentContextValue {
  record: ConsentRecord | null
  mode: ConsentMode
  gpc: boolean
  /** true once user has actively saved a choice (or GPC auto-applied) */
  saved: boolean
  /** effective category state (merges record + GPC) */
  categories: ConsentCategories
  bannerVisible: boolean
  accept: () => void
  reject: () => void
  update: (cats: Partial<Omit<ConsentCategories, "necessary">>) => void
  reopen: () => void
}
