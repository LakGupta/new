import type { Metadata } from "next";
import Link from "next/link";
import HistoricalJoinForm from "@/components/historical-join-form";

export const metadata: Metadata = {
  title: "Historical Queue · Helios Strap",
  description:
    "For people who messaged us before the waitlist webapp existed. Tell us when you messaged and we'll place you in the historical queue.",
};

export default function HistoricalPage() {
  return (
    <main className="relative flex-1 overflow-hidden px-4 py-10 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-glow-pulse absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="animate-fade-up delay-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-accent"
        >
          <BackIcon />
          Back to new queue
        </Link>

        <div className="animate-fade-up delay-2 mt-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            Historical queue
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Already messaged us?
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-muted-foreground">
            If you messaged us before this waitlist existed, fill this form with
            your Reddit username, WhatsApp, and the exact date &amp; time you
            messaged. Your queue position will be based on that time.
          </p>
        </div>

        <div className="animate-fade-up delay-3 mt-8">
          <HistoricalJoinForm />
        </div>

        <p className="animate-fade-up delay-4 mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          First come, first served · sorted by when you messaged
        </p>
      </div>
    </main>
  );
}

function BackIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
