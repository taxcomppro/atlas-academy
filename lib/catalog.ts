export type CatalogProduct = {
  product_key: string;
  title: string;
  product_type: "COURSE" | "TOOLKIT" | "TRAINING" | "BUNDLE";
  purchased: boolean;
  seats_purchased: number;
};

export type ProductPresentation = {
  description: string;
  image: string;
  purchaseUrl: string;
  staffSeatsAvailable: boolean;
  audience: string;
};

const tcpFeedUrl = "https://www.taxcomppro.com/feed";

export const productPresentation: Record<string, ProductPresentation> = {
  "training:irs-fine-defense": {
    description:
      "A staff due-diligence course with assessment, acknowledgment, certificates, and office compliance records.",
    image: "/assets/staff-audit-ready-due-diligence.png",
    purchaseUrl: tcpFeedUrl,
    staffSeatsAvailable: true,
    audience: "ERO teams and tax preparers",
  },
  "toolkit:irs-fine-defense": {
    description:
      "A practical office toolkit for organizing due-diligence procedures, documentation, staff resources, and audit-readiness materials.",
    image: "/assets/irs-fine-defense-toolkit.png",
    purchaseUrl: tcpFeedUrl,
    staffSeatsAvailable: true,
    audience: "Tax offices and ERO teams",
  },
  "course:30-day-tax-office-launch": {
    description:
      "Build your tax office through 30 focused missions with practical implementation guidance.",
    image: "/assets/30-day-launch-transparent.png",
    purchaseUrl: "https://30daylaunch.taxcomppro.com/",
    staffSeatsAvailable: false,
    audience: "New and growing EROs",
  },
  "training:schedule-c-reconstruction": {
    description:
      "A structured method for interviewing, corroborating, and documenting reconstructed Schedule C records.",
    image: "/assets/schedule-c-toolkit.png",
    purchaseUrl: tcpFeedUrl,
    staffSeatsAvailable: true,
    audience: "EROs and tax preparers",
  },
  "training:audit-ready-playbook": {
    description:
      "Practical due-diligence workflows that help the entire office build a defensible preparation record.",
    image: "/assets/audit-playbook-toolkit.png",
    purchaseUrl: tcpFeedUrl,
    staffSeatsAvailable: true,
    audience: "ERO teams and tax preparers",
  },
};

export function presentationFor(productKey: string) {
  return (
    productPresentation[productKey] ?? {
      description: "Professional learning from Tax Compliance Pro.",
      image: "/assets/Atlas_Academy_Logo.png",
      purchaseUrl: tcpFeedUrl,
      staffSeatsAvailable: true,
      audience: "Tax professionals",
    }
  );
}

export { tcpFeedUrl };
