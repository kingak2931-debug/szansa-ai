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
      cards.forEach((card, i) => {
        gsap.set(card, {
          clearProps: "transform",
          autoAlpha: i === 0 ? 1 : 0,
          xPercent: 0,
          rotateY: 0,
          zIndex: i === 0 ? 10 : 1,
        });
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
        if (i === 0) {
          gsap.set(card, {
            xPercent: 0,
            rotateY: 0,
            autoAlpha: 1,
            z: 0,
            zIndex: 20,
          });
          return;
        }
        gsap.set(card, {
          xPercent: fromLeft ? -130 : 130,
          rotateY: fromLeft ? 32 : -32,
          autoAlpha: 0,
          z: -120,
          zIndex: i + 1,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(cards.length - 1, 1) * window.innerHeight}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        if (i === 0) return;

        const fromLeft = i % 2 === 0;
        const prev = cards[i - 1];
        const prevFromLeft = (i - 1) % 2 === 0;
        const slot = i - 1;

        // Previous card fully exits (autoAlpha → 0) so text never overlaps
        tl.to(
          prev,
          {
            xPercent: prevFromLeft ? 115 : -115,
            rotateY: prevFromLeft ? -24 : 24,
            autoAlpha: 0,
            z: -80,
            zIndex: 1,
            duration: 1,
            ease: "none",
          },
          slot,
        );

        tl.fromTo(
          card,
          {
            xPercent: fromLeft ? -130 : 130,
            rotateY: fromLeft ? 32 : -32,
            autoAlpha: 0,
            z: -120,
            zIndex: 10 + i,
          },
          {
            xPercent: 0,
            rotateY: 0,
            autoAlpha: 1,
            z: 0,
            zIndex: 30 + i,
            duration: 1,
            ease: "none",
          },
          slot,
        );
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
            data-panel-index={index}
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
