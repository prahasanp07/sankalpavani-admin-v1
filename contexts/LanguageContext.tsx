'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import en from '../locales/en.json';
import kn from '../locales/kn.json';
import te from '../locales/te.json';
import ta from '../locales/ta.json';
import sa from '../locales/sa.json';

export type SupportedLanguage = 'en' | 'kn' | 'te' | 'ta' | 'sa';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  shortCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', shortCode: 'EN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', shortCode: 'KN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', shortCode: 'TE' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', shortCode: 'TA' },
  { code: 'sa', label: 'Sanskrit', nativeName: 'संस्कृतम्', shortCode: 'SA' }
];

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguageOption: LanguageOption;
  languages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
}

const dictionaries: Record<SupportedLanguage, any> = {
  en,
  kn,
  te,
  ta,
  sa
};

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Load preferred language from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sankalpvani_language') as SupportedLanguage;
      if (saved && ['en', 'kn', 'te', 'ta', 'sa'].includes(saved)) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may be unavailable in restricted environments
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sankalpvani_language', lang);
    } catch {
      // Ignore storage errors
    }
  };

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    // 1. Try active language
    const val = getNestedValue(dictionaries[language], key);
    if (val !== undefined) return val;

    // 2. Fall back to English
    if (language !== 'en') {
      const fallbackVal = getNestedValue(dictionaries.en, key);
      if (fallbackVal !== undefined) return fallbackVal;
    }

    // 3. Fall back to provided fallback string or the raw key
    return fallback !== undefined ? fallback : key;
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    currentLanguageOption,
    languages: SUPPORTED_LANGUAGES,
    t
  }), [language, currentLanguageOption]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
