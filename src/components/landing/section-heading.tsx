import SegmentBar from "@/components/landing/segment-bar";

/** Eyebrow + Unbounded title used by every section. */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <SegmentBar filled={3} className="mb-5 w-24" segmentClassName="h-1.5" />
      <p className="label-mono">{eyebrow}</p>
      <h2
        id={id}
        className="mt-3 font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground"
      >
        {title}
      </h2>
      {children ? (
        <p className="lead mt-4 text-[0.9375rem] sm:text-base">
          {children}
        </p>
      ) : null}
    </div>
  );
}
