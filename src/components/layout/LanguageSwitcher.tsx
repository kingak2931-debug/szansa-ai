"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  const switchTo = (next: Locale) => {
    if (next !== locale) setLocale(next);
  };

  return (
    <div className="lang-switcher" role="group" aria-label={t.lang.current}>
      <button
        type="button"
        className={locale === "pl" ? "is-active" : undefined}
        aria-pressed={locale === "pl"}
        aria-label="Polski"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          switchTo("pl");
        }}
      >
        {t.lang.pl}
      </button>
      <span aria-hidden="true" className="lang-divider">
        |
      </span>
      <button
        type="button"
        className={locale === "en" ? "is-active" : undefined}
        aria-pressed={locale === "en"}
        aria-label="English"
        title={locale === "pl" ? t.lang.switchTo : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          switchTo("en");
        }}
      >
        {t.lang.en}
      </button>
    </div>
  );
}
