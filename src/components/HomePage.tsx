"use client";

import { useCallback, useState } from "react";
import { Navbar } from "./layout/Navbar";
import { Footer } from "./layout/Footer";
import { Preloader } from "./sections/Preloader";
import { Hero } from "./sections/Hero";
import { PanelScroll } from "./sections/PanelScroll";
import { MissionVision } from "./sections/MissionVision";
import { Donate } from "./sections/Donate";
import { Contact } from "./sections/Contact";
import { CookieConsent } from "./ui/CookieConsent";
import { PrivacyModal } from "./ui/PrivacyModal";

export function HomePage() {
  const [introReady, setIntroReady] = useState(false);
  const onIntroComplete = useCallback(() => setIntroReady(true), []);

  return (
    <>
      <Preloader onComplete={onIntroComplete} />
      <Navbar />
      <main id="main">
        <Hero introReady={introReady} />
        <PanelScroll />
        <MissionVision />
        <Donate />
        <Contact />
      </main>
      <Footer />
      <CookieConsent />
      <PrivacyModal />
    </>
  );
}
