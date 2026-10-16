import Reveal from "@/components/landing/reveal";
import { LANDING } from "@/lib/landing-config";

export default function FounderNote() {
  const { quote, handle } = LANDING.founder;
  if (!quote.trim()) return null;

  return (
    <Reveal
      aria-label="Why this exists"
      className="border-y border-line bg-surface"
    >
      <figure className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28">
        <span
          aria-hidden="true"
          className="block font-display text-7xl leading-none text-charge sm:text-8xl"
        >
          &ldquo;
        </span>
        <blockquote className="mt-2 max-w-3xl font-display text-[clamp(1.35rem,3.6vw,2.1rem)] font-bold leading-[1.3] tracking-[-0.02em] text-foreground">
          {quote}
        </blockquote>
        {handle ? (
          <figcaption className="mt-6 font-mono text-sm text-muted-foreground">
            — u/{handle.replace(/^\/?u\//i, "")}
          </figcaption>
        ) : null}
      </figure>
    </Reveal>
  );
}
