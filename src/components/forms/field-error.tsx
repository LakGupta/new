/** Always-visible inline error under a field (native tooltips fail in in-app browsers). */
export default function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-warn">
      {message}
    </p>
  );
}
