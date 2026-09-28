"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/components/providers/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

export function PanelScroll() {
  const { t, locale } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const cards = gsap.utils.toArray<HTMLElement>(".panel-card", track);

    if (prefersReduced) {
      cards.forEach((card) => {
        gsap.set(card, { clearProps: "all", opacity: 1, x: 0, rotateY: 0 });
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(cards, {
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      });

      cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        gsap.set(card, {
          xPercent: fromLeft ? -120 : 120,
          rotateY: fromLeft ? 28 : -28,
          opacity: 0.15,
          z: -80,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${cards.length * window.innerHeight * 0.85}`,
          pin: true,
          scrub: 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        tl.to(
          card,
          {
            xPercent: 0,
            rotateY: 0,
            opacity: 1,
            z: 0,
            duration: 1,
            ease: "none",
          },
          i,
        );
        if (i < cards.length - 1) {
          tl.to(
            card,
            {
              xPercent: fromLeft ? 40 : -40,
              rotateY: fromLeft ? -12 : 12,
              opacity: 0.35,
              z: -40,
              duration: 1,
              ease: "none",
            },
            i + 0.85,
          );
        }
      });
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [locale]);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="panel-section"
      aria-label={t.panels.aria}
    >
      <div ref={trackRef} className="panel-stage">
        {t.panels.items.map((item, index) => (
          <article
            key={`${locale}-${item.title}`}
            className={`panel-card side-${index % 2 === 0 ? "left" : "right"}`}
          >
            <span className="panel-tag">{item.tag}</span>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
            <span className="panel-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
