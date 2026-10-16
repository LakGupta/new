"use client";

import Link from "next/link";
import {
  ACTIVE_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type CombinedEntryWithPositions,
  type DuplicateEntryMatch,
  type DuplicateMatchField,
} from "@/lib/types";

interface DuplicateNoticeProps {
  matches: DuplicateEntryMatch[];
  /** The number the person just typed, so we can prefill the position lookup. */
  whatsapp?: string;
  /** Present on the main page; switches to the Check position tab. */
  onCheckPosition?: (whatsapp: string) => void;
}

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

function matchedOnText(matchedOn: DuplicateMatchField[]): string {
  const hasWhatsApp = matchedOn.includes("whatsapp");
  const hasUsername = matchedOn.includes("redditUsername");
  if (hasWhatsApp && hasUsername) {
    return "Matched this WhatsApp number and Reddit username.";
  }
  if (hasWhatsApp) return "Matched this WhatsApp number.";
  return "Matched this Reddit username.";
}

/**
 * Shown in place of a join form when the submission already exists, so people
 * see where they stand instead of silently creating a second queue entry.
 */
export default function DuplicateNotice({
  matches,
  whatsapp = "",
  onCheckPosition,
}: DuplicateNoticeProps) {
  const fields = new Set<DuplicateMatchField>();
  for (const match of matches) {
    for (const field of match.matchedOn) fields.add(field);
  }

  const reason =
    fields.has("whatsapp") && fields.has("redditUsername")
      ? "Your WhatsApp number and Reddit username are both already on this list."
      : fields.has("whatsapp")
        ? "Your WhatsApp number is already on this list."
        : "Your Reddit username is already on this list.";

  return (
    <div
      role="alert"
      aria-live="polite"
      className="animate-pop-in rounded-[10px] border border-signal/30 bg-surface p-5 sm:p-7"
    >
      <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-foreground">
        You already have a place
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {reason} No new entry was created — adding it again would put the same
        person in line twice.
      </p>

      <div className="mt-5 space-y-4">
        {matches.map(({ entry, matchedOn }) => (
          <DuplicateEntryCard
            key={`${entry.source}-${entry.id}`}
            entry={entry}
            matchedOn={matchedOn}
          />
        ))}
      </div>

      {onCheckPosition ? (
        <button
          type="button"
          onClick={() => onCheckPosition(whatsapp)}
          className="mt-6 btn-charge w-full py-3.5 text-base"
        >
          Check my live position
        </button>
      ) : (
        <Link
          href="/#join-form"
          className="mt-6 btn-ghost w-full px-4 text-base"
        >
          Check it on the main page
        </Link>
      )}

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        Details wrong, or you were skipped and want back in? Message us and
        we&apos;ll fix your entry.
      </p>
    </div>
  );
}

function DuplicateEntryCard({
  entry,
  matchedOn,
}: {
  entry: CombinedEntryWithPositions;
  matchedOn: DuplicateMatchField[];
}) {
  const isActive = ACTIVE_STATUSES.includes(entry.status);
  const shownPosition = isActive ? entry.activePosition : null;
  const timeLabel = entry.source === "historical" ? "Messaged" : "Joined";
  const timeValue =
    entry.source === "historical" ? entry.messagedAt : entry.createdAt;

  return (
    <div className="rounded-[10px] border border-line bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {isActive ? "Your current position" : "Queue status"}
          </p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-[-0.04em] text-charge">
            {shownPosition ? (
              `#${shownPosition}`
            ) : (
              <span className="text-xl font-semibold text-muted-foreground">
                Not active
              </span>
            )}
          </p>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <p className="mt-3 text-sm leading-6 text-foreground/80">
        {isActive
          ? `You joined at #${entry.position} and you're now #${shownPosition} in line.`
          : `You joined at #${entry.position} but you're no longer in the active waitlist (${STATUS_LABELS[
              entry.status
            ].toLowerCase()}).`}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-line bg-surface px-4 py-3 text-sm">
        <p className="font-semibold text-foreground">
          u/{entry.redditUsername}
        </p>
        <span className="font-mono text-xs text-muted-foreground">
          +{entry.whatsapp}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {entry.source === "historical" ? "Historical entry" : "Website entry"} ·{" "}
        {timeLabel} {timeValue ? formatDate(timeValue) : "—"}
      </p>
      <p className="mt-2 text-xs leading-5 text-signal">
        {matchedOnText(matchedOn)}
      </p>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: CombinedEntryWithPositions["status"];
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-medium ring-1 ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
