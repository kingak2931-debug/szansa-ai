import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { CookieProvider } from "@/components/providers/CookieProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { dictionaries } from "@/lib/i18n";
import "./globals.css";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: dictionaries.pl.meta.title,
  description: dictionaries.pl.meta.description,
  metadataBase: new URL("https://szansaai.pl"),
  openGraph: {
    title: dictionaries.pl.meta.title,
    description: dictionaries.pl.meta.description,
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${syne.variable} ${jakarta.variable}`}>
      <body>
        <LanguageProvider>
          <CookieProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </CookieProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
