"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Consent = "pending" | "accepted" | "rejected";

type CookieContextValue = {
  consent: Consent;
  accept: () => void;
  reject: () => void;
  privacyOpen: boolean;
  openPrivacy: () => void;
  closePrivacy: () => void;
};

const CookieContext = createContext<CookieContextValue | null>(null);
const STORAGE_KEY = "szansa-ai-cookie-consent";

export function CookieProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent>("pending");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Consent | null;
    if (saved === "accepted" || saved === "rejected") {
      setConsent(saved);
    }
    setHydrated(true);
  }, []);

  const accept = useCallback(() => {
    setConsent("accepted");
    window.localStorage.setItem(STORAGE_KEY, "accepted");
  }, []);

  const reject = useCallback(() => {
    setConsent("rejected");
    window.localStorage.setItem(STORAGE_KEY, "rejected");
  }, []);

  const openPrivacy = useCallback(() => {
    setPrivacyOpen(true);
  }, []);

  const closePrivacy = useCallback(() => {
    setPrivacyOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      consent: hydrated ? consent : "pending",
      accept,
      reject,
      privacyOpen,
      openPrivacy,
      closePrivacy,
    }),
    [accept, closePrivacy, consent, hydrated, openPrivacy, privacyOpen, reject],
  );

  return (
    <CookieContext.Provider value={value}>{children}</CookieContext.Provider>
  );
}

export function useCookie() {
  const ctx = useContext(CookieContext);
  if (!ctx) {
    throw new Error("useCookie must be used within CookieProvider");
  }
  return ctx;
}
