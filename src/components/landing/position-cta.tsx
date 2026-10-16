"use client";

import { SHOW_POSITION_EVENT } from "@/components/landing/events";

/** Ghost CTA: opens the Check position tab and scrolls to the form. */
export default function PositionCta({ className = "" }: { className?: string }) {
  return (
    <a
      href="#join-form"
      onClick={() => window.dispatchEvent(new Event(SHOW_POSITION_EVENT))}
      className={`btn-ghost px-5 ${className}`}
    >
      Check my position
    </a>
  );
}
