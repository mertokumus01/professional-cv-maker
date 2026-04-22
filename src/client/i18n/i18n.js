import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from './locales/en.json';
import trTranslation from './locales/tr.json';

// Language resources
const resources = {
  en: { translation: enTranslation },
  tr: { translation: trTranslation },
};

// Get saved language or default to English
const getSavedLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('app-language') || 'en';
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app-language', lng);
  }
});

export default i18n;
