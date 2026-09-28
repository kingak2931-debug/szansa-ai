"use client";

import { useCookie } from "../providers/CookieProvider";
import { useLanguage } from "../providers/LanguageProvider";

export function CookieConsent() {
  const { consent, accept, reject, openPrivacy } = useCookie();
  const { t } = useLanguage();

  if (consent !== "pending") return null;

  return (
    <div
      className="cookie-bar"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
    >
      <div className="cookie-copy">
        <h2 id="cookie-title">{t.cookie.title}</h2>
        <p id="cookie-desc">{t.cookie.body}</p>
        <button
          type="button"
          className="linkish cookie-privacy-link"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openPrivacy();
          }}
        >
          {t.cookie.privacy}
        </button>
      </div>
      <div className="cookie-actions">
        <button type="button" className="btn btn-ghost" onClick={reject}>
          {t.cookie.reject}
        </button>
        <button type="button" className="btn btn-primary" onClick={accept}>
          {t.cookie.accept}
        </button>
      </div>
    </div>
  );
}
