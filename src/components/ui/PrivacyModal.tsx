"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { foundationLegal } from "../../lib/legal";
import { useCookie } from "../providers/CookieProvider";
import { useLanguage } from "../providers/LanguageProvider";

export function PrivacyModal() {
  const { privacyOpen, closePrivacy } = useCookie();
  const { t } = useLanguage();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!privacyOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePrivacy();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [privacyOpen, closePrivacy]);

  if (!privacyOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={closePrivacy}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id={titleId}>{t.privacy.title}</h2>
          <button
            ref={closeRef}
            type="button"
            className="icon-btn"
            onClick={closePrivacy}
            aria-label={t.a11y.closeModal}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="modal-body">
          <h3>{t.privacy.admin}</h3>
          <p>{t.privacy.adminBody}</p>
          <p>{t.privacy.rights}</p>
          <p>{t.privacy.cookies}</p>
          <p>
            <a
              href={foundationLegal.documents.privacy}
              target="_blank"
              rel="noreferrer"
            >
              {t.privacy.fullDoc} →
            </a>
          </p>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-primary" onClick={closePrivacy}>
            {t.privacy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
