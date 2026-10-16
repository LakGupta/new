"use client";

import { useReveal } from "@/components/use-reveal";

/** Section that fades up 16px the first time it enters the viewport. */
export default function Reveal({
  id,
  className = "",
  children,
  ...rest
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={id} className={`reveal ${className}`} {...rest}>
      {children}
    </section>
  );
}
