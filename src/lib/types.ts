export const STATUSES = [
  "waiting",
  "contacted",
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

export const ACTIVE_STATUSES: EntryStatus[] = ["waiting", "contacted"];

export const STATUS_LABELS: Record<EntryStatus, string> = {
  waiting: "Waiting",
  contacted: "Contacted",
  sold: "Sold",
  "no-response": "No response",
  skipped: "Skipped",
};

export const STATUS_COLORS: Record<EntryStatus, string> = {
  waiting: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  contacted: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  sold: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  "no-response": "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  skipped: "bg-zinc-500/15 text-zinc-400 ring-zinc-400/20",
};
