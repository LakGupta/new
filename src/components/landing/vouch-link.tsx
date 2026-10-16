import { ExternalIcon, UpvoteIcon } from "@/components/landing/icons";
import { LANDING } from "@/lib/landing-config";

/** Link to the Reddit thread where earlier buyers vouch for us. */
export default function VouchLink({
  variant = "card",
  className = "",
}: {
  variant?: "card" | "chip" | "text";
  className?: string;
}) {
  if (!LANDING.vouchUrl) return null;

  const common = {
    href: LANDING.vouchUrl,
    target: "_blank",
    rel: "noopener noreferrer",
  };

  if (variant === "chip") {
    return (
      <a
        {...common}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border border-line px-3 font-mono text-xs text-signal transition-colors duration-[120ms] hover:border-signal ${className}`}
      >
        <UpvoteIcon className="h-3.5 w-3.5" />
        Vouches
        <ExternalIcon className="h-3 w-3" />
      </a>
    );
  }

  if (variant === "text") {
    return (
      <a
        {...common}
        className={`inline-flex min-h-11 items-center gap-1.5 text-signal underline-offset-4 hover:underline ${className}`}
      >
        Buyer vouches on Reddit
        <ExternalIcon />
      </a>
    );
  }

  return (
    <a
      {...common}
      className={`group flex min-h-14 items-center gap-3 rounded-[8px] border border-signal/40 bg-signal/[0.06] px-4 py-3 transition-colors duration-[120ms] hover:border-signal hover:bg-signal/10 ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-signal text-background">
        <UpvoteIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          Read buyer vouches
        </span>
        <span className="block truncate font-mono text-xs text-signal">
          r/AmazfitHelioStrap
        </span>
      </span>
      <ExternalIcon className="h-4 w-4 text-signal transition-transform duration-[120ms] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}
