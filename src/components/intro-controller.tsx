"use client";

import { useEffect } from "react";

const FILL_MS = 1300;
const EXIT_START_MS = 1670;
const EXIT_END_MS = 2170;
const SAFETY_MS = 3000;

export const LOADED_EVENT = "helios:loaded";

/** True once the intro has cleared (or was skipped). */
export function introDone(): boolean {
  const root = document.documentElement;
  return root.dataset.loaded !== undefined || root.dataset.intro === "skip";
}

function captionFor(pct: number): string {
  if (pct >= 100) return "charged.";
  if (pct >= 45) return "syncing queue…";
  return "pairing…";
}

/**
 * Drives the server-rendered #intro overlay. The segments run on CSS, so the
 * % readout reads the overlay's own animation clock to stay in step even when
 * hydration lands late.
 */
export default function IntroController() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const overlay = document.getElementById("intro");
    const pctEl = document.getElementById("intro-pct");
    const captionEl = document.getElementById("intro-caption");
    let finished = false;
    let frame = 0;
    // Switches off the CSS no-JS failsafe for scroll reveals.
    root.dataset.hydrated = "";

    function finish() {
      if (finished) return;
      finished = true;
      root.dataset.loaded = "";
      body.style.overflow = "";
      if (overlay) overlay.style.pointerEvents = "none";
      try {
        sessionStorage.setItem("helios:intro", "1");
      } catch {
        // Private mode or blocked storage: the intro just plays again.
      }
      window.dispatchEvent(new Event(LOADED_EVENT));
    }

    if (
      !overlay ||
      root.dataset.intro === "skip" ||
      getComputedStyle(overlay).display === "none"
    ) {
      finish();
      return;
    }

    body.style.overflow = "hidden";
    const mountedAt = performance.now();
    const clock = overlay.getAnimations()[0];

    function elapsed(): number {
      const time = clock?.currentTime;
      return typeof time === "number" ? time : performance.now() - mountedAt;
    }

    function tick() {
      const t = elapsed();
      const progress = Math.min(1, t / FILL_MS);
      const pct = Math.round((1 - (1 - progress) ** 2) * 100);
      if (pctEl) pctEl.textContent = String(pct);
      if (captionEl) captionEl.textContent = captionFor(pct);

      if (t >= EXIT_START_MS) finish();
      if (t < EXIT_END_MS) {
        frame = requestAnimationFrame(tick);
      } else if (overlay) {
        overlay.style.display = "none";
      }
    }
    frame = requestAnimationFrame(tick);

    const safety = window.setTimeout(() => {
      overlay.style.display = "none";
      finish();
    }, SAFETY_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(safety);
      body.style.overflow = "";
    };
  }, []);

  return null;
}
