import VouchLink from "@/components/landing/vouch-link";
import { PRODUCT_PRICE } from "@/lib/product";

export function WordMark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-[-0.03em] ${className}`}>
      HELIO
      <span className="font-mono font-normal tracking-normal text-muted-foreground">
        {" "}/ queue
      </span>
    </span>
  );
}

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-3 px-4"
      >
        <a href="#top" className="flex min-h-11 items-center whitespace-nowrap text-base sm:text-lg">
          <WordMark />
        </a>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <VouchLink variant="chip" />
          </span>
          <span className="hidden min-h-11 items-center rounded-[6px] border border-line px-3 font-mono text-xs tabular-nums text-foreground min-[380px]:inline-flex">
            {PRODUCT_PRICE}
          </span>
          <a href="#join-form" className="btn-charge min-h-11 whitespace-nowrap px-4 text-sm">
            Join queue
          </a>
        </div>
      </nav>
    </header>
  );
}
