"use client";

import { useCallback, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/sections/Preloader";
import { Hero } from "@/components/sections/Hero";
import { PanelScroll } from "@/components/sections/PanelScroll";
import { MissionVision } from "@/components/sections/MissionVision";
import { Donate } from "@/components/sections/Donate";
import { Contact } from "@/components/sections/Contact";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { PrivacyModal } from "@/components/ui/PrivacyModal";

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
