export const COUNTRIES = {
  il: {
    code: 'il' as const,
    nameHe: 'ישראל',
    en: 'ISRAEL',
    accent: '#2356C7',
    currency: { symbol: '₪', name: 'שקל ₪', usdRate: 3.7 },
    shipLabel: 'ישראל',
    flag: 'linear-gradient(#fff 0 18%, #2356C7 18% 33%, #fff 33% 67%, #2356C7 67% 82%, #fff 82% 100%)',
    presets: ['ישראל', '1948', 'המשפחה שלי'],
  },
  us: {
    code: 'us' as const,
    nameHe: 'ארצות הברית',
    en: 'USA',
    accent: '#C0202E',
    currency: { symbol: '$', name: 'דולר $', usdRate: 1 },
    shipLabel: 'ארצות הברית',
    // CORRECT US flag: Red | White | Blue (left to right)
    flag: 'linear-gradient(90deg, #C0202E 33.3%, #fff 33.3% 66.6%, #3C3B6E 66.6%)',
    presets: ['ארצות הברית', '1776', 'המשפחה שלי'],
  },
  gb: {
    code: 'gb' as const,
    nameHe: 'בריטניה',
    en: 'UK',
    accent: '#012169',
    currency: { symbol: '£', name: 'ליש"ט £', usdRate: 0.79 },
    shipLabel: 'בריטניה',
    flag: 'linear-gradient(90deg, #012169 33.3%, #fff 33.3% 66.6%, #C8102E 66.6%)',
    presets: ['בריטניה', '1066', 'המשפחה שלי'],
  },
  de: {
    code: 'de' as const,
    nameHe: 'גרמניה',
    en: 'GERMANY',
    accent: '#B8860B',
    currency: { symbol: '€', name: 'אירו €', usdRate: 0.92 },
    shipLabel: 'גרמניה',
    flag: 'linear-gradient(#1a1a1a 33.3%, #D7141A 33.3% 66.6%, #E8B100 66.6%)',
    presets: ['גרמניה', '1871', 'המשפחה שלי'],
  },
  fr: {
    code: 'fr' as const,
    nameHe: 'צרפת',
    en: 'FRANCE',
    accent: '#0B3D91',
    currency: { symbol: '€', name: 'אירו €', usdRate: 0.92 },
    shipLabel: 'צרפת',
    flag: 'linear-gradient(90deg, #0B3D91 33.3%, #fff 33.3% 66.6%, #C0202E 66.6%)',
    presets: ['צרפת', '1789', 'המשפחה שלי'],
  },
  it: {
    code: 'it' as const,
    nameHe: 'איטליה',
    en: 'ITALY',
    accent: '#0A7D34',
    currency: { symbol: '€', name: 'אירו €', usdRate: 0.92 },
    shipLabel: 'איטליה',
    flag: 'linear-gradient(90deg, #0A7D34 33.3%, #fff 33.3% 66.6%, #C0202E 66.6%)',
    presets: ['איטליה', '1861', 'המשפחה שלי'],
  },
} as const

export type CountryCode = keyof typeof COUNTRIES
export type Country = (typeof COUNTRIES)[CountryCode]

export function isValidCountry(code: string): code is CountryCode {
  return code in COUNTRIES
}

export function formatCountryPrice(usdPrice: number, country: Country): string {
  const converted = Math.round(usdPrice * country.currency.usdRate)
  if (country.code === 'il') return `${converted} ₪`
  return `${country.currency.symbol}${converted}`
}
