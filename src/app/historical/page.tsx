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
    <main className="grain relative flex-1 overflow-x-clip px-4 py-10 sm:py-16">

      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="animate-fade-up delay-1 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-[120ms] hover:text-charge"
        >
          <BackIcon />
          Back to new queue
        </Link>

        <div className="animate-fade-up delay-2 mt-6 text-center">
          <p className="label-mono text-charge">Historical queue</p>
          <h1 className="mt-3 text-balance font-display text-[clamp(2rem,8vw,3rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Already messaged us?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-7 text-muted-foreground">
            If you messaged us before this waitlist existed, fill this form with
            your Reddit username, WhatsApp, and the exact date &amp; time you
            messaged. Your queue position will be based on that time.
          </p>
        </div>

        <div className="animate-fade-up delay-3 mt-8">
          <HistoricalJoinForm />
        </div>

        <p className="animate-fade-up delay-4 mt-8 text-center text-xs leading-5 text-muted-foreground">
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
