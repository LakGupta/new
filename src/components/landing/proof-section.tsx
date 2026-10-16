import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Reveal from "@/components/landing/reveal";
import SectionHeading from "@/components/landing/section-heading";
import { LANDING, type ProofItem } from "@/lib/landing-config";

function hasImage(src?: string): src is string {
  if (!src) return false;
  return existsSync(path.join(process.cwd(), "public", src));
}

function formatCheckedOn(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProofSection() {
  if (LANDING.proof.length === 0) return null;

  return (
    <Reveal
      aria-labelledby="proof-title"
      className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28"
    >
      <SectionHeading
        id="proof-title"
        eyebrow="The receipt"
        title="Don't take our word for it."
      >
        Here&apos;s what the official listings show.
      </SectionHeading>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {LANDING.proof.map((item) => (
          <BrowserCard key={item.url} item={item} />
        ))}
      </div>

      <p className="mt-5 font-mono text-xs text-muted-foreground">
        Snapshot as of {formatCheckedOn(LANDING.proofCheckedOn)}; may change.
      </p>
    </Reveal>
  );
}

function BrowserCard({ item }: { item: ProofItem }) {
  const image = hasImage(item.image) ? item.image : null;

  return (
    <figure className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-3 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-[6px] bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
          {item.url}
        </span>
      </div>

      <div className="relative flex min-h-56 items-center justify-center p-6">
        {image ? (
          <Image
            src={image}
            alt={`${item.url} showing ${item.status}`}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 34rem"
            className="h-auto w-full rounded-[6px] opacity-80"
          />
        ) : (
          <div className="w-full space-y-3" aria-hidden="true">
            <div className="h-3 w-2/3 rounded-[2px] bg-surface-2" />
            <div className="h-3 w-1/2 rounded-[2px] bg-surface-2" />
            <div className="mt-6 flex h-11 w-40 items-center justify-center rounded-[6px] border border-line font-mono text-xs text-muted-foreground line-through">
              Add to cart
            </div>
          </div>
        )}

        <span className="absolute right-5 top-1/2 -translate-y-1/2 -rotate-6 rounded-[6px] border-2 border-warn bg-background/80 px-3 py-1.5 font-mono text-sm font-bold tracking-[0.18em] text-warn">
          UNAVAILABLE
        </span>
      </div>

      <figcaption className="border-t border-line px-4 py-3 text-sm text-muted-foreground">
        Listing says:{" "}
        <span className="font-medium text-foreground">{item.status}</span>
      </figcaption>
    </figure>
  );
}
