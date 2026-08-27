"use client";

import { useState } from "react";

export default function ProductDetails() {
  const [open, setOpen] = useState(false);

  const rows = [
    { label: "Price", value: "₹13,000" },
    { label: "Shipping", value: "PAN India · complimentary" },
    { label: "Face-to-face", value: "Available in Bangalore" },
    { label: "COD", value: "Not available" },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="product-details"
        className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent shadow-[0_0_0_rgba(59,130,246,0)] transition-all duration-300 hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] active:scale-[0.98]"
      >
        <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
          Details
        </span>
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent transition-transform duration-500 ${
            open ? "rotate-45" : ""
          }`}
        >
          <PlusIcon />
        </span>
      </button>

      <div
        id="product-details"
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">
            <div className="divide-y divide-border rounded-xl border border-border bg-background">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="text-right text-sm font-semibold text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              We don&apos;t offer COD. Once the box is opened, returns leave us
              with a big loss, so all orders are prepaid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
