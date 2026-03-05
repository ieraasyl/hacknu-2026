import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/i18n/locales/en.json';
import kk from '@/i18n/locales/kk.json';
import ru from '@/i18n/locales/ru.json';

export const supportedLngs = ['en', 'kk', 'ru'] as const;
export type SupportedLng = (typeof supportedLngs)[number];

const resources = {
  en: { translation: en },
  kk: { translation: kk },
  ru: { translation: ru },
};

const isBrowser = typeof window !== 'undefined';

const instance = i18n.use(initReactI18next);
if (isBrowser) {
  instance.use(LanguageDetector);
}

instance.init({
  lng: isBrowser ? undefined : 'en',
  resources,
  fallbackLng: 'en',
  supportedLngs: [...supportedLngs],
  ...(isBrowser && {
    detection: {
      order: ['cookie', 'navigator'],
      lookupCookie: 'locale',
      caches: ['cookie'],
      cookieOptions: { path: '/', maxAge: 365 * 24 * 60 * 60 },
    },
  }),
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
