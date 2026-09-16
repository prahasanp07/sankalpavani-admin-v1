'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../contexts/LanguageContext';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, currentLanguageOption, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 text-on-surface hover:text-primary transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-sm ${
          isOpen ? 'ring-2 ring-primary/20 border-primary/50' : ''
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t('header.selectLanguage', 'Select Language')}
      >
        <Languages size={14} className="text-primary shrink-0" />
        
        <span className="text-xs font-semibold tracking-tight">
          {currentLanguageOption.nativeName}
        </span>

        {!compact && (
          <span className="text-[9px] font-mono font-bold text-primary px-1 py-0.2 rounded bg-primary/10">
            {currentLanguageOption.shortCode}
          </span>
        )}

        <ChevronDown
          size={12}
          className={`text-on-surface-variant/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Language Selection Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl py-1.5 z-50 animate-[slideDown_0.15s_ease-out]">
            <div className="px-3.5 py-2 border-b border-outline-variant/20 bg-surface-container-low/40">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                {t('header.selectLanguage', 'Select Language')}
              </p>
            </div>

            <div className="p-1 space-y-0.5">
              {languages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0 border border-outline-variant/30">
                        {lang.shortCode}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {lang.nativeName}
                        </p>
                        <p className="text-[10px] text-on-surface-variant opacity-75 truncate">
                          {lang.label}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-primary shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
