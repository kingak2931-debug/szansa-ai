"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Compass, Eye, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

const icons = [Compass, Eye, HeartHandshake];

export function MissionVision() {
  const { t, locale } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".mission-card", {
        scrollTrigger: {
          trigger: root,
          start: "top 75%",
        },
        y: 60,
        rotateX: 18,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        transformOrigin: "center bottom",
      });
    }, root);

    return () => ctx.revert();
  }, [locale]);

  const toggle = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section
      ref={rootRef}
      id="mission"
      className="mission-section"
      aria-labelledby="mission-title"
    >
      <div className="section-intro">
        <p className="eyebrow">{t.mission.eyebrow}</p>
        <h2 id="mission-title">{t.mission.title}</h2>
      </div>

      <div className="mission-grid" style={{ perspective: "1400px" }}>
        {t.mission.cards.map((card, index) => {
          const Icon = icons[index] ?? Compass;
          const isFlipped = !!flipped[index];
          return (
            <button
              key={`${locale}-${card.title}`}
              type="button"
              className={`mission-card ${isFlipped ? "is-flipped" : ""}`}
              onClick={() => toggle(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(index);
                }
              }}
              aria-pressed={isFlipped}
              aria-label={`${card.title}. ${t.mission.flipHint}`}
            >
              <div className="mission-card-inner">
                <div className="mission-face front">
                  <Icon className="mission-icon" aria-hidden size={28} />
                  <h3>{card.title}</h3>
                  <span className="mission-hint">{t.mission.flipHint}</span>
                </div>
                <div className="mission-face back">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
