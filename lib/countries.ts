export const COUNTRIES = {
  il: {
    code: 'il' as const,
    nameHe: 'ישראל',
    nameEn: 'Israel',
    en: 'ISRAEL',
    emoji: '🇮🇱',
    accent: '#2356C7',
    currency: { symbol: '₪', name: 'שקל ₪', nameEn: 'ILS ₪', usdRate: 3.7 },
    shipLabel: 'ישראל',
    shipLabelEn: 'Israel',
    flag: 'linear-gradient(#fff 0 18%, #2356C7 18% 33%, #fff 33% 67%, #2356C7 67% 82%, #fff 82% 100%)',
    presets: ['ישראל', '1948', 'המשפחה שלי'],
  },
  us: {
    code: 'us' as const,
    nameHe: 'ארצות הברית',
    nameEn: 'United States',
    en: 'USA',
    emoji: '🇺🇸',
    accent: '#C0202E',
    currency: { symbol: '$', name: 'דולר $', nameEn: 'Dollar $', usdRate: 1 },
    shipLabel: 'ארצות הברית',
    shipLabelEn: 'the USA',
    flag: 'linear-gradient(90deg, #C0202E 33.3%, #fff 33.3% 66.6%, #3C3B6E 66.6%)',
    presets: ['United States', '1776', 'My Family'],
  },
  gb: {
    code: 'gb' as const,
    nameHe: 'בריטניה',
    nameEn: 'United Kingdom',
    en: 'UK',
    emoji: '🇬🇧',
    accent: '#012169',
    currency: { symbol: '£', name: 'ליש"ט £', nameEn: 'Pound £', usdRate: 0.79 },
    shipLabel: 'בריטניה',
    shipLabelEn: 'the UK',
    flag: 'linear-gradient(90deg, #012169 33.3%, #fff 33.3% 66.6%, #C8102E 66.6%)',
    presets: ['United Kingdom', '1066', 'My Family'],
  },
  de: {
    code: 'de' as const,
    nameHe: 'גרמניה',
    nameEn: 'Germany',
    en: 'GERMANY',
    emoji: '🇩🇪',
    accent: '#B8860B',
    currency: { symbol: '€', name: 'אירו €', nameEn: 'Euro €', usdRate: 0.92 },
    shipLabel: 'גרמניה',
    shipLabelEn: 'Germany',
    flag: 'linear-gradient(#1a1a1a 33.3%, #D7141A 33.3% 66.6%, #E8B100 66.6%)',
    presets: ['Germany', '1871', 'My Family'],
  },
  fr: {
    code: 'fr' as const,
    nameHe: 'צרפת',
    nameEn: 'France',
    en: 'FRANCE',
    emoji: '🇫🇷',
    accent: '#0B3D91',
    currency: { symbol: '€', name: 'אירו €', nameEn: 'Euro €', usdRate: 0.92 },
    shipLabel: 'צרפת',
    shipLabelEn: 'France',
    flag: 'linear-gradient(90deg, #0B3D91 33.3%, #fff 33.3% 66.6%, #C0202E 66.6%)',
    presets: ['France', '1789', 'My Family'],
  },
  it: {
    code: 'it' as const,
    nameHe: 'איטליה',
    nameEn: 'Italy',
    en: 'ITALY',
    emoji: '🇮🇹',
    accent: '#0A7D34',
    currency: { symbol: '€', name: 'אירו €', nameEn: 'Euro €', usdRate: 0.92 },
    shipLabel: 'איטליה',
    shipLabelEn: 'Italy',
    flag: 'linear-gradient(90deg, #0A7D34 33.3%, #fff 33.3% 66.6%, #C0202E 66.6%)',
    presets: ['Italy', '1861', 'My Family'],
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
