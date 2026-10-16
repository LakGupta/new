"use client";

import { useState } from "react";
import SubmitButton from "@/components/forms/submit-button";
import {
  ACTIVE_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type CombinedEntryWithPositions,
} from "@/lib/types";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function StatusPill({ status }: { status: CombinedEntryWithPositions["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function PositionLookup({
  queueName = "Amazfit Helio Strap",
  initialWhatsapp = "",
}: {
  queueName?: string;
  /** Prefills the field, e.g. when arrived from a duplicate notice. */
  initialWhatsapp?: string;
}) {
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<CombinedEntryWithPositions[] | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setChecking(true);
    setResults(null);

    try {
      const response = await fetch("/api/queue/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setResults(data.entries as CombinedEntryWithPositions[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[10px] border border-line bg-background p-5 sm:p-7"
      noValidate
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="lookup-whatsapp"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            WhatsApp number
          </label>
          <input
            id="lookup-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            required
            inputMode="tel"
            maxLength={20}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="98765 43210"
            className="field font-mono"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            No +91 needed — just type your 10-digit WhatsApp number exactly as
            you joined with it.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-[8px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn"
          >
            {error}
          </div>
        ) : null}

        <SubmitButton busy={checking} busyLabel="Checking queue position">
          Check my position
        </SubmitButton>
      </div>

      {results ? (
        <div className="mt-6 space-y-3 border-t border-line pt-6">
          {results.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-line py-10 text-center">
              <p className="text-base font-semibold text-foreground">
                No match found
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                We couldn&apos;t find that WhatsApp number in the {queueName}{" "}
                queue. Double-check the number you used to join.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                {results.length === 1 ? "1 result found" : `${results.length} results found`}
              </p>
              <p className="rounded-[6px] border border-line bg-surface-2 px-3 py-2 text-xs leading-5 text-muted-foreground">
                Note: your queue number may go up if people before you in the
                queue decide not to purchase.
              </p>
              {results.map((entry) => (
                <PositionResultCard
                  key={`${entry.source}-${entry.id}`}
                  entry={entry}
                />
              ))}
            </>
          )}
        </div>
      ) : null}
    </form>
  );
}

function PositionResultCard({
  entry,
}: {
  entry: CombinedEntryWithPositions;
}) {
  const isActive = ACTIVE_STATUSES.includes(entry.status);
  const shownPosition = isActive ? entry.activePosition : null;
  const timeLabel = entry.source === "historical" ? "Messaged" : "Joined";
  const timeValue = entry.source === "historical" ? entry.messagedAt : entry.createdAt;

  return (
    <div className="animate-pop-in rounded-[10px] border border-charge/40 bg-background p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {isActive ? "Your queue position" : "Queue status"}
          </p>
          <p className="mt-2 font-display text-5xl font-bold tabular-nums tracking-[-0.04em] text-charge">
            {shownPosition ? (
              `#${shownPosition}`
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                Not active
              </span>
            )}
          </p>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <p className="mt-4 text-sm leading-6 text-foreground/80">
        {isActive
          ? `You're currently #${shownPosition} in line. Original signup position was #${entry.position}.`
          : `This number was originally #${entry.position} in the queue, but is no longer in the active waitlist (${STATUS_LABELS[entry.status].toLowerCase()}).`}
      </p>

      <div className="mt-4 rounded-[8px] border border-line bg-surface p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-foreground">
            u/{entry.redditUsername}
          </p>
          <span className="font-mono text-xs text-muted-foreground">
            +{entry.whatsapp}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {entry.source === "historical" ? (
            <>
              Historical entry · verified before the website existed · {timeLabel}{" "}
              {timeValue ? formatDate(timeValue) : "—"}
            </>
          ) : (
            <>
              Website queue entry · {timeLabel} {timeValue ? formatDate(timeValue) : "—"}
            </>
          )}
        </p>
      </div>

      {entry.note ? (
        <div className="mt-4 rounded-[8px] border border-line bg-surface px-4 py-3">
          <p className="flex items-center gap-1.5 label-mono">
            <NoteIcon />
            Your note
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {entry.note}
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-[8px] border border-line bg-surface px-4 py-3 text-xs text-muted-foreground">
          No note was added to this entry.
        </p>
      )}
    </div>
  );
}

function NoteIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
