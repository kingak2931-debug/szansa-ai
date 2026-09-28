"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  const switchTo = (next: Locale) => {
    setLocale(next);
  };

  return (
    <div
      className="lang-switcher"
      role="group"
      aria-label={t.lang.current}
    >
      <button
        type="button"
        className={locale === "pl" ? "is-active" : undefined}
        aria-pressed={locale === "pl"}
        onClick={() => switchTo("pl")}
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
        onClick={() => switchTo("en")}
        title={locale === "pl" ? t.lang.switchTo : undefined}
      >
        {t.lang.en}
      </button>
    </div>
  );
}
