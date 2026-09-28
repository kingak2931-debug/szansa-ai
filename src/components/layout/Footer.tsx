"use client";

import Image from "next/image";
import { foundationLegal } from "@/lib/legal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCookie } from "@/components/providers/CookieProvider";

export function Footer() {
  const { t } = useLanguage();
  const { openPrivacy } = useCookie();

  return (
    <footer className="site-footer" id="legal">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <Image
              src="/brand/logo-sygnet.svg"
              alt=""
              width={44}
              height={44}
            />
            <strong>{t.footer.brand}</strong>
          </div>
          <p>{t.footer.tagline}</p>
          <p className="footer-note">{t.footer.placeholderNote}</p>
        </div>

        <div>
          <h2 className="footer-heading">{t.footer.legalTitle}</h2>
          <ul className="footer-list">
            <li>
              <span>NIP</span> {foundationLegal.nip}
            </li>
            <li>
              <span>REGON</span> {foundationLegal.regon}
            </li>
            <li>
              <span>KRS</span> {foundationLegal.krs}
            </li>
            <li>
              <span>{t.footer.address}</span> {foundationLegal.address.full}
            </li>
            <li>
              <span>{t.footer.email}</span>{" "}
              <a href={`mailto:${foundationLegal.email}`}>
                {foundationLegal.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="footer-heading">{t.footer.docsTitle}</h2>
          <ul className="footer-list docs">
            <li>
              <a href={foundationLegal.documents.statut} target="_blank" rel="noreferrer">
                {t.footer.statut}
              </a>
            </li>
            <li>
              <a
                href={foundationLegal.documents.childProtection}
                target="_blank"
                rel="noreferrer"
              >
                {t.footer.som}{" "}
                <span className="muted">{t.footer.somNote}</span>
              </a>
            </li>
            <li>
              <span className="reports-soon">
                {t.footer.reports} — {t.footer.reportsSoon}
              </span>
            </li>
            <li>
              <button type="button" className="linkish" onClick={openPrivacy}>
                {t.footer.privacy}
              </button>
            </li>
            <li>
              <a
                href={foundationLegal.documents.collectionRules}
                target="_blank"
                rel="noreferrer"
              >
                {t.footer.collection}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="footer-copy">{t.footer.copyright}</p>
    </footer>
  );
}
