"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type HeroProps = {
  introReady: boolean;
};

export function Hero({ introReady }: HeroProps) {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!introReady || !rootRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", {
        y: 36,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      });
      gsap.to(".hero-orb", {
        y: 24,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-grid-shift", {
        backgroundPosition: "40px 40px",
        duration: 18,
        repeat: -1,
        ease: "none",
      });
    }, rootRef);

    return () => ctx.revert();
  }, [introReady]);

  return (
    <section
      ref={rootRef}
      id="top"
      className={`hero ${introReady ? "is-ready" : ""}`}
      aria-labelledby="hero-brand"
    >
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-grid hero-grid-shift" />
        <div className="hero-orb orb-a" />
        <div className="hero-orb orb-b" />
        <div className="hero-horizon" />
        <svg
          className="hero-constellation"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label=""
        >
          <title>Abstract neural constellation representing AI education</title>
          <g stroke="currentColor" strokeWidth="1.2" opacity="0.55">
            <line x1="420" y1="180" x2="520" y2="120" />
            <line x1="420" y1="180" x2="560" y2="220" />
            <line x1="420" y1="180" x2="380" y2="280" />
            <line x1="420" y1="180" x2="300" y2="160" />
            <line x1="560" y1="220" x2="620" y2="300" />
            <line x1="380" y1="280" x2="480" y2="340" />
            <line x1="300" y1="160" x2="240" y2="240" />
          </g>
          <g fill="currentColor">
            <circle cx="420" cy="180" r="7" />
            <circle cx="520" cy="120" r="4" />
            <circle cx="560" cy="220" r="5" />
            <circle cx="380" cy="280" r="4" />
            <circle cx="300" cy="160" r="3.5" />
            <circle cx="620" cy="300" r="3" />
            <circle cx="480" cy="340" r="3.5" />
            <circle cx="240" cy="240" r="3" />
          </g>
        </svg>
      </div>

      <div className="hero-content">
        <p className="hero-anim hero-kicker">{t.hero.kicker}</p>
        <h1 id="hero-brand" className="hero-anim hero-brand">
          {t.hero.brand}
        </h1>
        <p className="hero-anim hero-headline">{t.hero.headline}</p>
        <p className="hero-anim hero-sub">{t.hero.sub}</p>
        <div className="hero-anim hero-ctas">
          <a href="#mission" className="btn btn-primary">
            {t.hero.ctaMission}
          </a>
          <a href="#donate" className="btn btn-outline">
            {t.hero.ctaDonate}
          </a>
        </div>
      </div>

      <a href="#story" className="hero-scroll" aria-label={t.hero.scrollHint}>
        <span>{t.hero.scrollHint}</span>
        <ArrowDown size={18} aria-hidden />
      </a>
    </section>
  );
}
