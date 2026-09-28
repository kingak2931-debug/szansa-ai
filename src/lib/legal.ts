/**
 * Official registry data for Fundacja „Szansa AI".
 * Bank / BLIK payment fields remain placeholders until production credentials are set.
 */
export const foundationLegal = {
  name: 'Fundacja „Szansa AI"',
  shortName: "Szansa AI",
  krs: "0001221999",
  nip: "6040267132",
  regon: "543905350",
  address: {
    street: "ul. Świerkowa 3",
    postalCode: "83-042",
    city: "Ełganowo",
    country: "Polska",
    full: "ul. Świerkowa 3, 83-042 Ełganowo",
  },
  email: "kontakt@szansaai.pl",
  supervision:
    "minister właściwy do spraw edukacji oraz Prezydent Miasta Gdańska",
  /** PLACEHOLDER — replace with the foundation’s real PLN IBAN before go-live */
  bankAccount: {
    iban: "PL00 0000 0000 0000 0000 0000 0000",
    bankName: "[PLACEHOLDER] Nazwa banku",
    recipient: 'Fundacja „Szansa AI"',
    transferTitle: "Darowizna na cele statutowe",
    isPlaceholder: true,
  },
  /** PLACEHOLDER — BLIK / payment operator link */
  blik: {
    phoneLabel: "[PLACEHOLDER] numer BLIK / PayU",
    note: "Płatność BLIK zostanie aktywowana po podłączeniu operatora płatności.",
    isPlaceholder: true,
  },
  documents: {
    statut: "/legal/statut-fundacji.md",
    privacy: "/legal/polityka-prywatnosci.md",
    childProtection: "/legal/standardy-ochrony-maloletnich.md",
    collectionRules: "/legal/regulamin-zbiorki.md",
  },
} as const;

export type FoundationLegal = typeof foundationLegal;
