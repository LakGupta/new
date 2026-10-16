import Image from "next/image";
import CountUp from "@/components/landing/count-up";
import { ArrowRightIcon } from "@/components/landing/icons";
import PositionCta from "@/components/landing/position-cta";
import VouchLink from "@/components/landing/vouch-link";
import { LANDING } from "@/lib/landing-config";
import { PRODUCT_PRICE } from "@/lib/product";

const TAGS = [
  { label: "Screen-free", className: "left-[4%] top-[14%]" },
  { label: "Prepaid only", className: "right-[2%] top-[46%]" },
  { label: "Free shipping", className: "bottom-[10%] left-[10%]" },
];

export default function Hero() {
  const stat = LANDING.heroStat;
  const showStat = typeof stat.value === "number" && stat.value > 0;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="mx-auto grid min-h-[calc(88vh-4rem)] max-w-[1100px] items-center gap-12 px-4 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
    >
      <div>
        <p className="hero-in label-mono text-charge">
          Amazfit Helio Strap · India
        </p>
        <h1
          id="hero-title"
          className="mt-5 font-display text-[clamp(2.4rem,8.5vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.045em] text-foreground"
        >
          Sold out everywhere.
          <br />
          <span className="text-charge">Charging up here.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
          Amazfit India and Amazon can&apos;t sell you one right now. Get in the
          queue with your Reddit username and WhatsApp, and we&apos;ll message
          you in the order you joined.
        </p>

        <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#join-form" className="btn-charge px-6 text-base">
            Join the queue
            <ArrowRightIcon />
          </a>
          <PositionCta />
        </div>

        <div className="hero-in mt-10">
          <dl className="grid grid-cols-3 divide-x divide-line rounded-[8px] border border-line bg-surface">
            <StatTile value={PRODUCT_PRICE} label="Price" />
            <StatTile value="PAN India" label="Ships free" />
            {showStat ? (
              <StatTile value={<CountUp value={stat.value} />} label={stat.label} />
            ) : (
              <StatTile value="Bangalore" label="Face-to-face" />
            )}
          </dl>
          <VouchLink className="mt-3" />
        </div>
      </div>

      <HeroVisual />
    </section>
  );
}

function StatTile({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0 px-3 py-4 sm:px-5">
      <dt className="label-mono truncate text-[0.625rem] sm:text-[0.6875rem]">{label}</dt>
      <dd className="mt-1.5 truncate font-mono text-[0.95rem] font-semibold tabular-nums text-foreground sm:text-lg">
        {value}
      </dd>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
      {/* Charge ring: track + fill, starts at 12 o'clock. */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="var(--charge-dim)" strokeWidth="1" />
        <circle
          cx="50"
          cy="50"
          r="48.5"
          fill="none"
          stroke="var(--charge)"
          strokeWidth="1.6"
          strokeLinecap="round"
          pathLength={100}
          className="charge-ring"
        />
      </svg>

      <div className="absolute inset-[14.6%] overflow-hidden rounded-[10px] border border-line bg-surface">
        <Image
          src="/images/hero.jpg"
          alt="Amazfit Helio Strap"
          fill
          loading="eager"
          sizes="(max-width: 1024px) 70vw, 22rem"
          className="object-cover"
        />
      </div>

      <p className="absolute right-[6%] top-[3%] font-mono text-sm text-charge">
        <CountUp value={100} suffix="%" />
      </p>

      {TAGS.map((tag) => (
        <span
          key={tag.label}
          className={`absolute rounded-[6px] border border-line bg-background/90 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-foreground ${tag.className}`}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
