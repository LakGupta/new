import SegmentBar from "@/components/landing/segment-bar";
import { LANDING } from "@/lib/landing-config";
import { PRODUCT_PRICE } from "@/lib/product";

const ROWS = [
  { label: "Price", value: PRODUCT_PRICE },
  { label: "Shipping", value: "Free, PAN India" },
  { label: "Contact", value: "via WhatsApp" },
  { label: "Payment", value: "Prepaid" },
];

/** Status card beside the form, styled as a tear-off queue ticket. */
export default function QueueTicket() {
  const filled = Math.max(0, Math.min(10, Math.round(LANDING.dropStatus.filledSegments)));

  return (
    <div className="rounded-[10px] border border-line bg-surface">
      <div className="px-5 pb-5 pt-6 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="label-mono text-charge">Queue ticket</p>
          <p className="font-mono text-xs text-muted-foreground">Helio Strap</p>
        </div>
        <p className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground">
          Your spot, saved.
        </p>
      </div>

      <div className="ticket-perf -mx-px" aria-hidden="true" />

      <dl className="space-y-3 px-5 py-5 sm:px-6">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="label-mono">{row.label}</dt>
            <dd className="font-mono text-sm tabular-nums text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-line px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <p className="label-mono">Drop status</p>
          <p className="font-mono text-xs text-muted-foreground">{LANDING.dropStatus.label}</p>
        </div>
        <SegmentBar filled={filled} className="mt-3" segmentClassName="h-3" />
        <p className="sr-only">
          {LANDING.dropStatus.label}: {filled} of 10 segments filled.
        </p>
      </div>
    </div>
  );
}
