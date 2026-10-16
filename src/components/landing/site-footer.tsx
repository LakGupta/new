import Link from "next/link";
import { WordMark } from "@/components/landing/site-nav";
import VouchLink from "@/components/landing/vouch-link";
import { LANDING } from "@/lib/landing-config";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-12 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <WordMark className="text-lg" />
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            First come, first served. Historical and website entries share one
            queue order.
          </p>
          {LANDING.contactEmail ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Questions?{" "}
              <a href={`mailto:${LANDING.contactEmail}`} className="text-signal underline-offset-4 hover:underline">
                {LANDING.contactEmail}
              </a>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-1 text-sm">
          <Link
            href="/historical"
            className="inline-flex min-h-11 items-center text-foreground underline-offset-4 hover:text-charge hover:underline"
          >
            Messaged us before this site? Join the historical queue →
          </Link>
          <VouchLink variant="text" className="text-sm" />
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1100px] px-4 py-6 text-xs leading-5 text-muted-foreground">
          Independent reseller. Not affiliated with, endorsed by or an authorised
          retailer of Amazfit or Zepp Health. Amazfit and Helio Strap are
          trademarks of their respective owners, used here only to describe the
          product we sell.
        </p>
      </div>
    </footer>
  );
}
