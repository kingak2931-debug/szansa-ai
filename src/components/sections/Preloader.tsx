"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLanguage } from "../providers/LanguageProvider";

type PreloaderProps = {
  onComplete: () => void;
};

export function Preloader({ onComplete }: PreloaderProps) {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setDone(true);
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          setDone(true);
          onComplete();
        },
      });

      tl.from(".pre-line", {
        y: 48,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
      })
        .from(
          ".pre-mission",
          { opacity: 0, y: 20, duration: 0.7 },
          "-=0.35",
        )
        .to({}, { duration: 0.55 })
        .to(root, {
          yPercent: -100,
          duration: 1.05,
          ease: "power4.inOut",
        });
    }, root);

    return () => ctx.revert();
  }, [onComplete]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="preloader"
      role="status"
      aria-live="polite"
      aria-label={t.preloader.mission}
    >
      <div className="preloader-inner">
        <p className="pre-kicker">Szansa AI</p>
        <p className="pre-line">{t.preloader.line1}</p>
        <p className="pre-line accent">{t.preloader.line2}</p>
        <p className="pre-mission">{t.preloader.mission}</p>
        <div className="pre-progress" aria-hidden="true" />
      </div>
    </div>
  );
}
