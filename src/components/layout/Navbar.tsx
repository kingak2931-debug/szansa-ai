"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../providers/LanguageProvider";
import { cn } from "../../lib/utils";

const links = [
  { href: "#mission", key: "mission" as const },
  { href: "#story", key: "panels" as const },
  { href: "#donate", key: "donate" as const },
  { href: "#contact", key: "contact" as const },
];

export function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("site-header", scrolled && "is-scrolled")}>
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <nav className="nav-shell" aria-label={t.nav.aria}>
        <a href="#top" className="brand-lockup" onClick={() => setOpen(false)}>
          <Image
            src="/brand/logo-sygnet.svg"
            alt=""
            width={36}
            height={36}
            className="brand-mark"
            priority
          />
          <span className="brand-word">Szansa AI</span>
        </a>

        <div className={`nav-cluster ${open ? "is-open" : ""}`}>
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>
          <LanguageSwitcher />
          <a
            href="#donate"
            className="nav-cta"
            onClick={() => setOpen(false)}
          >
            {t.hero.ctaDonate}
          </a>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </nav>
    </header>
  );
}
