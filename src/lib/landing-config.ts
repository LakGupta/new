/**
 * Every editable claim on the landing page lives here, so copy changes never
 * need a JSX edit. A section whose config is empty hides itself.
 */

export interface ProofItem {
  /** Shown in the fake browser URL bar. */
  url: string;
  /** What the store page says, e.g. "Sold out". */
  status: string;
  /** Optional screenshot in /public, e.g. "/images/proof-1.png". */
  image?: string;
}

export interface SpecItem {
  value: string;
  label: string;
}

export const LANDING = {
  // A count of 0 hides the tile.
  heroStat: { label: "Buyers served", value: 0 }, // TODO: confirm

  // 0–10 filled segments on the queue ticket.
  dropStatus: { label: "Current drop", filledSegments: 6 }, // TODO: confirm

  proof: [
    {
      url: "in.amazfit.com/products/helio-strap",
      status: "Sold out",
      image: "/images/proof-1.png",
    },
    {
      url: "amazon.in",
      status: "Currently unavailable",
      image: "/images/proof-2.png",
    },
  ] as ProofItem[],
  proofCheckedOn: "2026-10-16", // TODO: confirm

  // Reddit thread where past buyers vouch for us. Empty hides every vouch link.
  vouchUrl: "https://www.reddit.com/r/AmazfitHelioStrap/s/toAT5Y1eQM",

  founder: { quote: "", handle: "" }, // TODO: owner writes

  // Checked against us.amazfit.com/products/helio-strap on 2026-10-16.
  // TODO: verify against amazfit.com (India listing) before launch.
  specs: [
    { value: "10 days", label: "battery, typical use" },
    { value: "20 g", label: "weight" },
    { value: "5 ATM", label: "water resistance" },
    { value: "50+", label: "sports modes" },
    { value: "6.0", label: "BioTracker PPG sensor" },
    { value: "₹0", label: "subscription required" },
  ] as SpecItem[],
  specFeatures: [
    "Continuous heart rate",
    "HRV",
    "Sleep",
    "Temperature",
    "Bluetooth 5.2",
    "Zepp App",
  ],

  // Extra lines for "The honest part", e.g. what to know about warranty.
  honestPart: [] as string[], // TODO: owner writes

  contactEmail: "", // optional
};
