import Reveal from "@/components/landing/reveal";
import SectionHeading from "@/components/landing/section-heading";
import { LANDING } from "@/lib/landing-config";

const FACTS = [
  {
    title: "We're resellers, not Amazfit.",
    body: "An independent reseller run from Reddit. Not Amazfit, not Zepp Health, not an authorised retailer.",
  },
  {
    title: "Prepaid only. No COD.",
    body: "Once a box is opened, a return leaves us with a big loss, so every order is paid before it ships.",
  },
  {
    title: "Shipping is on us.",
    body: "Complimentary shipping anywhere in India. In Bangalore, you can collect face-to-face instead.",
  },
];

export default function HonestPart() {
  return (
    <Reveal
      aria-labelledby="honest-title"
      className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeading id="honest-title" eyebrow="The honest part" title="What we are, and aren't." />

        <ul className="divide-y divide-line border-y border-line">
          {FACTS.map((fact) => (
            <li key={fact.title} className="py-5">
              <p className="font-semibold text-foreground">{fact.title}</p>
              <p className="mt-1 leading-7 text-muted-foreground">{fact.body}</p>
            </li>
          ))}
          {LANDING.honestPart.map((line) => (
            <li key={line} className="py-5 leading-7 text-muted-foreground">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
