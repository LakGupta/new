"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCT_PRICE } from "@/lib/product";

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this an official Amazfit store?",
    a: "No. We're an independent reseller, not Amazfit or Zepp Health. We source the strap ourselves and sell it to people in this queue.",
  },
  {
    q: "How does the queue order work?",
    a: "Your place is set by when you joined. When stock arrives we message people one by one in that order. If someone passes or doesn't reply, the offer moves to the next person.",
  },
  {
    q: "I messaged you before this site existed. What now?",
    a: (
      <>
        Use the{" "}
        <Link href="/historical" className="text-signal underline underline-offset-4">
          historical queue form
        </Link>{" "}
        and tell us when you messaged. Your place is based on that time, after we
        verify it.
      </>
    ),
  },
  {
    q: "How do I check my position?",
    a: "Open the Check position tab in the queue section below and enter the WhatsApp number you joined with.",
  },
  {
    q: "Can I pay on delivery?",
    a: `No. All orders are prepaid (${PRODUCT_PRICE}). Once a box is opened, a return leaves us with a big loss, so we don't offer COD.`,
  },
  {
    q: "Do you ship outside Bangalore?",
    a: "Yes. Shipping is complimentary anywhere in India. If you're in Bangalore, face-to-face handover is also available.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {QUESTIONS.map((item, index) => {
        const isOpen = open === index;
        const panelId = `faq-panel-${index}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-base font-semibold text-foreground transition-colors duration-[120ms] hover:text-charge sm:text-lg"
              >
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-line font-mono text-charge"
                >
                  <span
                    className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="max-w-2xl pb-5 leading-7 text-muted-foreground">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
