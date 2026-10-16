/** Lime submit button; while busy its label becomes a looping 5-segment bar. */
export default function SubmitButton({
  busy,
  busyLabel,
  children,
  ref,
}: {
  busy: boolean;
  busyLabel: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button ref={ref} type="submit" disabled={busy} className="btn-charge w-full py-3.5 text-base">
      {busy ? (
        <span
          role="progressbar"
          aria-label={busyLabel}
          aria-valuetext="Processing"
          className="seg-loop flex h-3 w-24 gap-1"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="flex-1 rounded-[2px] bg-background" />
          ))}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
