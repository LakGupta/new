export const STATUSES = [
  "waiting",
  "contacted",
  "interested",
  "sold",
  "no-response",
  "skipped",
] as const;

export type EntryStatus = (typeof STATUSES)[number];

export interface Entry {
  id: number;
  redditUsername: string;
  whatsapp: string;
  note: string | null;
  status: EntryStatus;
  createdAt: string;
}

export interface EntryWithPositions extends Entry {
  /** 1-based position in the full queue (everyone who ever joined). */
  position: number;
  /** 1-based position among people still waiting to be served, or null for sold/skipped. */
  activePosition: number | null;
}

export interface HistoricalEntry extends Entry {
  /** The date/time the buyer says they messaged you. */
  messagedAt: string;
}

export interface HistoricalEntryWithPositions extends HistoricalEntry {
  /** 1-based position in the full historical queue (sorted by messagedAt). */
  position: number;
  /** 1-based position among people still waiting to be served, or null for sold/skipped. */
  activePosition: number | null;
}

/** Which storage queue an entry belongs to in the consolidated queue view. */
export type QueueSource = "regular" | "historical";

/**
 * A normalised entry from either queue, used when the historical and regular
 * queues are shown/ranked together as one first-come, first-served queue.
 */
export interface CombinedEntry {
  id: number;
  source: QueueSource;
  redditUsername: string;
  whatsapp: string;
  note: string | null;
  status: EntryStatus;
  createdAt: string;
  /** Present only when source === "historical". */
  messagedAt: string | null;
}

export interface CombinedEntryWithPositions extends CombinedEntry {
  /** 1-based position in the combined queue (everyone who ever joined/messaged). */
  position: number;
  /** 1-based position among people still waiting to be served, or null for sold/skipped. */
  activePosition: number | null;
}

export const ACTIVE_STATUSES: EntryStatus[] = [
  "waiting",
  "contacted",
  "interested",
];

export const STATUS_LABELS: Record<EntryStatus, string> = {
  waiting: "Waiting",
  contacted: "Contacted",
  interested: "Interested",
  sold: "Sold",
  "no-response": "No response",
  skipped: "Skipped",
};

export const STATUS_COLORS: Record<EntryStatus, string> = {
  waiting: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  contacted: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  interested: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  sold: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  "no-response": "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  skipped: "bg-zinc-500/15 text-zinc-400 ring-zinc-400/20",
};
