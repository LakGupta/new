"use client";

import { useEffect, useState } from "react";
import { LOADED_EVENT, introDone } from "@/components/intro-controller";

const DURATION_MS = 1200;

/**
 * Renders the final value on the server. If the intro is still playing it
 * drops to 0 behind the overlay and counts up once helios:loaded fires; on a
 * skipped intro (repeat visit, reduced motion) it just stays at the value.
 */
export default function CountUp({
  value,
  suffix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (introDone()) return;

    let frame = 0;
    const start = () => {
      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / DURATION_MS);
        setShown(Math.round((1 - (1 - progress) ** 3) * value));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    // Hidden behind the overlay, so the drop to 0 is never seen.
    frame = requestAnimationFrame(() => setShown(0));
    window.addEventListener(LOADED_EVENT, start, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(LOADED_EVENT, start);
    };
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`}>
      {shown.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
