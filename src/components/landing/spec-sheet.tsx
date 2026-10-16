import Reveal from "@/components/landing/reveal";
import SectionHeading from "@/components/landing/section-heading";
import { LANDING } from "@/lib/landing-config";

export default function SpecSheet() {
  if (LANDING.specs.length === 0) return null;

  return (
    <Reveal
      aria-labelledby="specs-title"
      className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28"
    >
      <SectionHeading id="specs-title" eyebrow="Spec sheet" title="Small band. Big numbers." />

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line lg:grid-cols-3">
        {LANDING.specs.map((spec) => (
          <div key={spec.label} className="flex flex-col-reverse justify-end bg-surface p-5 sm:p-8">
            <dt className="label-mono mt-3">{spec.label}</dt>
            <dd className="whitespace-nowrap font-display text-[clamp(2rem,6vw,3.5rem)] font-bold leading-none tracking-[-0.04em] text-foreground">
              <SpecValue value={spec.value} />
            </dd>
          </div>
        ))}
      </dl>

      {LANDING.specFeatures.length > 0 ? (
        <p className="mt-6 font-mono text-xs uppercase leading-6 tracking-[0.14em] text-muted-foreground">
          {LANDING.specFeatures.join("  ·  ")}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        Source: Amazfit&apos;s official product page.
      </p>
    </Reveal>
  );
}

/** "10 days" → big "10", small "days", so long values fit a phone-width tile. */
function SpecValue({ value }: { value: string }) {
  const [head, ...rest] = value.split(" ");
  if (rest.length === 0) return <>{value}</>;
  return (
    <>
      {head}
      <span className="ml-1.5 font-mono text-base font-normal tracking-normal text-muted-foreground sm:text-lg">
        {rest.join(" ")}
      </span>
    </>
  );
}
