"use client";

import { useEffect, useState } from "react";

const COLORS = ["var(--charge)", "var(--signal)", "var(--foreground)"];
const COUNT = 24;

// Deterministic spread (golden angle), so render stays pure.
const PIECES = Array.from({ length: COUNT }, (_, index) => {
  const angle = index * 2.39996;
  const distance = 70 + ((index * 37) % 90);
  return {
    color: COLORS[index % COLORS.length],
    dx: Math.cos(angle) * distance,
    // Bias upward, then let it fall a little past the origin.
    dy: Math.sin(angle) * distance * 0.8 - 50 + ((index * 13) % 40),
    rot: ((index * 97) % 540) - 270,
    delay: (index % 6) * 18,
  };
});

/**
 * A one-shot burst of 24 squares from a screen point (the submit button).
 * Hidden by CSS under reduced motion; removes itself after 1.6s.
 */
export default function Confetti({ origin }: { origin: { x: number; y: number } | null }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!origin || !visible) return null;

  return (
    <div aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={
            {
              left: origin.x,
              top: origin.y,
              background: piece.color,
              animationDelay: `${piece.delay}ms`,
              "--dx": `${piece.dx}px`,
              "--dy": `${piece.dy}px`,
              "--rot": `${piece.rot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Centre of an element in viewport coordinates, for the confetti origin. */
export function centerOf(element: HTMLElement | null): { x: number; y: number } | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
