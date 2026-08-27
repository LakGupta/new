import { promises as fs } from "node:fs";
import path from "node:path";
import postgres, { type Sql } from "postgres";
import type { Entry, EntryStatus, EntryWithPositions } from "./types";
import { ACTIVE_STATUSES } from "./types";

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const isPostgres = Boolean(DATABASE_URL);

let sql: Sql<Record<string, never>> | null = null;
let ensurePromise: Promise<void> | null = null;

function getSql(): Sql<Record<string, never>> {
  if (!sql) {
    sql = postgres(DATABASE_URL as string, {
      ssl: "require",
      max: 1,
    });
  }
  return sql;
}

function ensureTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = getSql()`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        reddit_username TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        note TEXT,
        status TEXT NOT NULL DEFAULT 'waiting',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return ensurePromise;
}

interface EntryRow {
  id: number;
  reddit_username: string;
  whatsapp: string;
  note: string | null;
  status: EntryStatus;
  created_at: Date | string;
}

function mapRow(row: EntryRow): Entry {
  return {
    id: row.id,
    redditUsername: row.reddit_username,
    whatsapp: row.whatsapp,
    note: row.note,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Local JSON fallback (used when DATABASE_URL is not set, e.g. quick previews)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "queue.json");

async function readJsonEntries(): Promise<Entry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Entry[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonEntries(entries: Entry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listEntries(): Promise<EntryWithPositions[]> {
  if (isPostgres) {
    await ensureTable();
    const rows = await getSql()<EntryRow[]>`
      SELECT id, reddit_username, whatsapp, note, status, created_at
      FROM entries
      ORDER BY created_at ASC, id ASC
    `;

    let activeCount = 0;
    return rows.map((row, index) => {
      const entry = mapRow(row);
      const isActive = ACTIVE_STATUSES.includes(entry.status);
      if (isActive) activeCount += 1;
      return {
        ...entry,
        position: index + 1,
        activePosition: isActive ? activeCount : null,
      };
    });
  }

  const entries = await readJsonEntries();
  let activeCount = 0;
  return entries
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id)
    .map((entry, index) => {
      const isActive = ACTIVE_STATUSES.includes(entry.status);
      if (isActive) activeCount += 1;
      return {
        ...entry,
        position: index + 1,
        activePosition: isActive ? activeCount : null,
      };
    });
}

export async function createEntry(input: {
  redditUsername: string;
  whatsapp: string;
  note: string;
}): Promise<{ entry: Entry; position: number }> {
  if (isPostgres) {
    await ensureTable();
    const rows = await getSql()<EntryRow[]>`
      INSERT INTO entries (reddit_username, whatsapp, note)
      VALUES (${input.redditUsername}, ${input.whatsapp}, ${input.note || null})
      RETURNING id, reddit_username, whatsapp, note, status, created_at
    `;
    const entry = mapRow(rows[0]);
    const countRows = await getSql()<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM entries
    `;
    return { entry, position: Number(countRows[0].count) };
  }

  const entries = await readJsonEntries();
  const nextId = entries.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  const entry: Entry = {
    id: nextId,
    redditUsername: input.redditUsername,
    whatsapp: input.whatsapp,
    note: input.note || null,
    status: "waiting",
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  await writeJsonEntries(entries);
  return { entry, position: entries.length };
}

export async function updateEntry(
  id: number,
  patch: Partial<Pick<Entry, "redditUsername" | "whatsapp" | "note" | "status">>,
): Promise<Entry | null> {
  if (isPostgres) {
    await ensureTable();
    const existingRows = await getSql()<EntryRow[]>`
      SELECT id, reddit_username, whatsapp, note, status, created_at
      FROM entries
      WHERE id = ${id}
    `;
    if (!existingRows[0]) return null;

    const existing = mapRow(existingRows[0]);
    const merged = {
      redditUsername: patch.redditUsername ?? existing.redditUsername,
      whatsapp: patch.whatsapp ?? existing.whatsapp,
      note: patch.note !== undefined ? patch.note : existing.note,
      status: patch.status ?? existing.status,
    };

    const rows = await getSql()<EntryRow[]>`
      UPDATE entries
      SET
        reddit_username = ${merged.redditUsername},
        whatsapp = ${merged.whatsapp},
        note = ${merged.note},
        status = ${merged.status}
      WHERE id = ${id}
      RETURNING id, reddit_username, whatsapp, note, status, created_at
    `;
    return rows[0] ? mapRow(rows[0]) : null;
  }

  const entries = await readJsonEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const current = entries[index];
  const updated: Entry = {
    ...current,
    redditUsername: patch.redditUsername ?? current.redditUsername,
    whatsapp: patch.whatsapp ?? current.whatsapp,
    note: patch.note !== undefined ? patch.note : current.note,
    status: patch.status ?? current.status,
  };
  entries[index] = updated;
  await writeJsonEntries(entries);
  return updated;
}

export async function deleteEntry(id: number): Promise<boolean> {
  if (isPostgres) {
    await ensureTable();
    const result = await getSql()`
      DELETE FROM entries WHERE id = ${id}
    `;
    return result.count > 0;
  }

  const entries = await readJsonEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  await writeJsonEntries(filtered);
  return true;
}
