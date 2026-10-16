/** The recurring 10-cell "battery" motif. Purely visual. */
export default function SegmentBar({
  filled = 10,
  total = 10,
  className = "",
  segmentClassName = "h-2",
}: {
  filled?: number;
  total?: number;
  className?: string;
  segmentClassName?: string;
}) {
  return (
    <div aria-hidden="true" className={`flex gap-1 ${className}`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`flex-1 rounded-[2px] ${segmentClassName} ${
            index < filled ? "bg-charge" : "bg-charge-dim"
          }`}
        />
      ))}
    </div>
  );
}
