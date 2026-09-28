import { foundationLegal } from "./legal";

export type Locale = "pl" | "en";

export const dictionaries = {
  pl: {
    meta: {
      title: "Fundacja Szansa AI — edukacja AI dla dzieci z małych miejscowości",
      description:
        "Uczymy dzieci z miejscowości do 20 tys. mieszkańców odpowiedzialnego, bezpiecznego i efektywnego korzystania ze sztucznej inteligencji.",
    },
    nav: {
      mission: "Misja",
      panels: "Opowieść",
      donate: "Wesprzyj",
      contact: "Kontakt",
      aria: "Nawigacja główna",
      openMenu: "Otwórz menu",
      closeMenu: "Zamknij menu",
      skip: "Przejdź do treści",
    },
    lang: {
      pl: "PL",
      en: "EN",
      switchTo: "Zmień język na angielski",
      current: "Aktualny język: polski",
    },
    preloader: {
      line1: "Sztuczna inteligencja to szansa.",
      line2: "Damy ją każdemu dziecku.",
      mission:
        "Edukujemy dzieci z małych miast i wsi — odpowiedzialnie, bezpiecznie i skutecznie.",
    },
    hero: {
      brand: "Szansa AI",
      kicker: "Fundacja",
      headline: "Sztuczna inteligencja to szansa.",
      sub: "Damy ją każdemu dziecku z małego miasta i wsi — zanim technologia pogłębi przepaść edukacyjną.",
      ctaMission: "Poznaj naszą misję",
      ctaDonate: "Przekaż darowiznę",
      scrollHint: "Przewiń",
    },
    panels: {
      aria: "Opowieść o misji — panele przewijane",
      items: [
        {
          title: "Małe miejscowości. Wielkie ambicje.",
          body: "Dzieci z miejscowości do 20 tys. mieszkańców rzadziej mają dostęp do mentorów, sprzętu i edukacji AI. My wjeżdżamy tam z warsztatami.",
          tag: "Diagnoza",
        },
        {
          title: "Odpowiedzialnie. Bezpiecznie. Efektywnie.",
          body: "Uczymy nie tylko narzędzi — uczymy krytycznego myślenia, etyki i bezpiecznych relacji z technologią.",
          tag: "Metoda",
        },
        {
          title: "Od szkoły wiejskiej do kompetencji przyszłości.",
          body: "Budujemy lokalne programy, szkolimy nauczycieli i zostawiamy ślad, który trwa dłużej niż jeden warsztat.",
          tag: "Wpływ",
        },
        {
          title: "Twoja darowizna = realna lekcja.",
          body: "Każda złotówka zasila trenerów, dojazdy i materiały. Publikujemy sprawozdania — transparentnie.",
          tag: "Wsparcie",
        },
      ],
    },
    mission: {
      eyebrow: "Misja i wizja",
      title: "Dlaczego istniejemy",
      cards: [
        {
          title: "Misja",
          body: "Nauka dzieci z małych miejscowości (do 20 tys. mieszkańców) odpowiedzialnego, bezpiecznego i efektywnego wykorzystywania sztucznej inteligencji.",
        },
        {
          title: "Wizja",
          body: "Polska, w której kod pocztowy nie determinuje dostępu do kompetencji przyszłości — a AI służy wyrównywaniu szans, nie ich pogłębianiu.",
        },
        {
          title: "Wartości",
          body: "Bezpieczeństwo dzieci ponad wszystko. Transparentność finansowa. Partnerstwo ze szkołami i samorządami. Etyka technologii w centrum.",
        },
      ],
      flipHint: "Najedź lub użyj klawisza Enter, aby odwrócić kartę",
    },
    donate: {
      eyebrow: "Wesprzyj nas",
      title: "Przekaż darowiznę",
      lead: "Darowizny na rachunek bankowy nie są zbiórką publiczną w rozumieniu ustawy. Środki przeznaczamy wyłącznie na cele statutowe.",
      bankTitle: "Przelew bankowy",
      recipient: "Odbiorca",
      account: "Numer rachunku (IBAN)",
      titleLabel: "Tytuł przelewu",
      bank: "Bank",
      placeholderBadge: "Dane tymczasowe — do uzupełnienia",
      blikTitle: "BLIK / płatność online",
      blikBody:
        "Moduł BLIK i płatności kartą uruchomimy po podłączeniu licencjonowanego operatora (np. PayU / Stripe).",
      copy: "Kopiuj",
      copied: "Skopiowano",
      impactTitle: "Wpływ Twojego wsparcia",
      stats: [
        { value: "20 tys.", label: "limit mieszkańców miejscowości, które obejmujemy" },
        { value: "100%", label: "środków na cele statutowe edukacji AI" },
        { value: "<25%", label: "cel kosztów administracyjnych" },
        { value: "KRS", label: foundationLegal.krs },
      ],
      krsNote: `Numer KRS do weryfikacji darowizny: ${foundationLegal.krs}`,
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Napisz do nas",
      lead: "Zgłoś szkołę, zapytaj o partnerstwo lub po prostu się przywitaj.",
      name: "Imię i nazwisko",
      email: "Adres e-mail",
      role: "Rola",
      roleOptions: [
        { value: "", label: "Wybierz…" },
        { value: "parent", label: "Rodzic / opiekun" },
        { value: "teacher", label: "Nauczyciel / szkoła" },
        { value: "sponsor", label: "Sponsor / firma" },
        { value: "volunteer", label: "Wolontariusz" },
        { value: "other", label: "Inne" },
      ],
      message: "Wiadomość",
      rodo:
        "Wyrażam zgodę na przetwarzanie moich danych osobowych przez Fundację „Szansa AI” w celu obsługi zapytania, zgodnie z Polityką prywatności.",
      privacyLink: "Polityka prywatności",
      submit: "Wyślij wiadomość",
      sending: "Wysyłanie…",
      success: "Dziękujemy! Odpowiemy najszybciej, jak to możliwe.",
      error: "Wystąpił błąd. Napisz proszę bezpośrednio na e-mail.",
      required: "To pole jest wymagane",
      invalidEmail: "Podaj poprawny adres e-mail",
      rodoRequired: "Zgoda RODO jest wymagana",
    },
    footer: {
      brand: "Szansa AI",
      tagline: "Edukacja AI dla dzieci z małych miejscowości i wsi.",
      legalTitle: "Dane rejestrowe",
      docsTitle: "Dokumenty",
      statut: "Statut Fundacji",
      som: "Standardy Ochrony Małoletnich",
      somNote: "(Ustawa Kamilka)",
      reports: "Sprawozdania",
      reportsSoon: "Wkrótce — po pierwszym roku obrotowym",
      privacy: "Polityka prywatności",
      collection: "Regulamin zbiórek",
      copyright: `© ${new Date().getFullYear()} Fundacja „Szansa AI". Wszelkie prawa zastrzeżone.`,
      address: "Adres",
      email: "E-mail",
      placeholderNote:
        "Numer rachunku bankowego i BLIK oznaczone jako PLACEHOLDER wymagają uzupełnienia przed startem produkcyjnym.",
    },
    cookie: {
      title: "Pliki cookies",
      body: "Używamy niezbędnych plików cookies do działania strony. Opcjonalne cookies analityczne włączymy dopiero po Twojej zgodzie (RODO / GDPR).",
      accept: "Akceptuj opcjonalne",
      reject: "Tylko niezbędne",
      privacy: "Polityka prywatności",
    },
    privacy: {
      title: "Polityka prywatności",
      close: "Zamknij",
      admin: "Administrator danych",
      adminBody: `Administratorem danych jest ${foundationLegal.name}, ${foundationLegal.address.full}, KRS ${foundationLegal.krs}, NIP ${foundationLegal.nip}, REGON ${foundationLegal.regon}. Kontakt: ${foundationLegal.email}.`,
      rights:
        "Przysługuje Ci prawo dostępu, sprostowania, usunięcia, ograniczenia, przenoszenia, sprzeciwu oraz skargi do Prezesa UODO.",
      fullDoc: "Pełny dokument",
      cookies:
        "Niezbędne cookies zapewniają bezpieczeństwo i działanie formularzy. Analityczne uruchamiamy wyłącznie po zgodzie.",
    },
    a11y: {
      closeModal: "Zamknij okno dialogowe",
    },
  },
  en: {
    meta: {
      title: "Szansa AI Foundation — AI education for children in small towns",
      description:
        "We teach children from towns under 20,000 residents how to use artificial intelligence responsibly, safely, and effectively.",
    },
    nav: {
      mission: "Mission",
      panels: "Story",
      donate: "Donate",
      contact: "Contact",
      aria: "Main navigation",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      skip: "Skip to content",
    },
    lang: {
      pl: "PL",
      en: "EN",
      switchTo: "Switch language to Polish",
      current: "Current language: English",
    },
    preloader: {
      line1: "Artificial intelligence is a chance.",
      line2: "We will give it to every child.",
      mission:
        "We educate children from small towns and rural areas — responsibly, safely, and effectively.",
    },
    hero: {
      brand: "Szansa AI",
      kicker: "Foundation",
      headline: "Artificial intelligence is a chance.",
      sub: "We bring it to every child in a small town or village — before technology widens the education gap.",
      ctaMission: "Discover our mission",
      ctaDonate: "Make a donation",
      scrollHint: "Scroll",
    },
    panels: {
      aria: "Mission story — scroll panels",
      items: [
        {
          title: "Small towns. Big ambition.",
          body: "Children in places under 20,000 residents rarely get mentors, hardware, and AI education. We bring workshops to them.",
          tag: "Insight",
        },
        {
          title: "Responsible. Safe. Effective.",
          body: "We teach more than tools — critical thinking, ethics, and healthy relationships with technology.",
          tag: "Method",
        },
        {
          title: "From rural schools to future skills.",
          body: "We build local programmes, train teachers, and leave lasting capacity beyond a single workshop.",
          tag: "Impact",
        },
        {
          title: "Your gift = a real lesson.",
          body: "Every złoty funds trainers, travel, and materials. We publish reports — transparently.",
          tag: "Support",
        },
      ],
    },
    mission: {
      eyebrow: "Mission & vision",
      title: "Why we exist",
      cards: [
        {
          title: "Mission",
          body: "Teaching children from small towns (under 20,000 residents) to use artificial intelligence responsibly, safely, and effectively.",
        },
        {
          title: "Vision",
          body: "A Poland where postcode no longer dictates access to future skills — and AI narrows gaps instead of widening them.",
        },
        {
          title: "Values",
          body: "Child safety first. Financial transparency. Partnership with schools and local governments. Technology ethics at the centre.",
        },
      ],
      flipHint: "Hover or press Enter to flip the card",
    },
    donate: {
      eyebrow: "Support us",
      title: "Make a donation",
      lead: "Bank-transfer gifts are not a public collection under Polish law. Funds go solely to statutory educational aims.",
      bankTitle: "Bank transfer",
      recipient: "Recipient",
      account: "Account number (IBAN)",
      titleLabel: "Transfer title",
      bank: "Bank",
      placeholderBadge: "Temporary data — to be completed",
      blikTitle: "BLIK / online payment",
      blikBody:
        "BLIK and card payments will go live once a licensed operator (e.g. PayU / Stripe) is connected.",
      copy: "Copy",
      copied: "Copied",
      impactTitle: "Impact of your support",
      stats: [
        { value: "20k", label: "population cap for communities we serve" },
        { value: "100%", label: "of gifts toward statutory AI education" },
        { value: "<25%", label: "admin cost target" },
        { value: "KRS", label: foundationLegal.krs },
      ],
      krsNote: `KRS number for gift verification: ${foundationLegal.krs}`,
    },
    contact: {
      eyebrow: "Contact",
      title: "Write to us",
      lead: "Nominate a school, ask about partnership, or simply say hello.",
      name: "Full name",
      email: "Email address",
      role: "Role",
      roleOptions: [
        { value: "", label: "Select…" },
        { value: "parent", label: "Parent / guardian" },
        { value: "teacher", label: "Teacher / school" },
        { value: "sponsor", label: "Sponsor / company" },
        { value: "volunteer", label: "Volunteer" },
        { value: "other", label: "Other" },
      ],
      message: "Message",
      rodo:
        "I consent to the processing of my personal data by the Szansa AI Foundation to handle this enquiry, in line with the Privacy Policy.",
      privacyLink: "Privacy Policy",
      submit: "Send message",
      sending: "Sending…",
      success: "Thank you! We will reply as soon as we can.",
      error: "Something went wrong. Please email us directly.",
      required: "This field is required",
      invalidEmail: "Enter a valid email address",
      rodoRequired: "RODO / GDPR consent is required",
    },
    footer: {
      brand: "Szansa AI",
      tagline: "AI education for children in small towns and rural areas.",
      legalTitle: "Registry details",
      docsTitle: "Documents",
      statut: "Foundation Statute",
      som: "Child Protection Standards",
      somNote: "(Ustawa Kamilka)",
      reports: "Reports",
      reportsSoon: "Coming soon — after the first financial year",
      privacy: "Privacy Policy",
      collection: "Collection rules",
      copyright: `© ${new Date().getFullYear()} Szansa AI Foundation. All rights reserved.`,
      address: "Address",
      email: "Email",
      placeholderNote:
        "Bank account and BLIK fields marked PLACEHOLDER must be completed before production launch.",
    },
    cookie: {
      title: "Cookies",
      body: "We use essential cookies to run the site. Optional analytics cookies load only with your consent (RODO / GDPR).",
      accept: "Accept optional",
      reject: "Essential only",
      privacy: "Privacy Policy",
    },
    privacy: {
      title: "Privacy Policy",
      close: "Close",
      admin: "Data controller",
      adminBody: `The controller is ${foundationLegal.name}, ${foundationLegal.address.full}, KRS ${foundationLegal.krs}, NIP ${foundationLegal.nip}, REGON ${foundationLegal.regon}. Contact: ${foundationLegal.email}.`,
      rights:
        "You have the right of access, rectification, erasure, restriction, portability, objection, and to lodge a complaint with the Polish DPA (UODO).",
      fullDoc: "Full document",
      cookies:
        "Essential cookies keep forms and security working. Analytics run only after consent.",
    },
    a11y: {
      closeModal: "Close dialog",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];
