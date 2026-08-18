import { redis } from './redis';

const NOTES_INDEX = 'notes:index';
const NOTE_KEY = (id: string) => `notes:n:${id}`;

export const PAGE_LIMIT_DEFAULT = 20;
const PAGE_LIMIT_MAX = 50;
/** Give up after this many pages when a tag filter is thinning the results. */
const FILTER_SCAN_PAGES_MAX = 5;

export interface NoteRow {
	id: string;
	body: string;
	tags: string[];
	createdAt: number;
	updatedAt: number;
	draft: boolean;
}

function parseTags(raw: unknown): string[] {
	if (Array.isArray(raw)) return raw.map(String);
	return String(raw ?? '')
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter(Boolean);
}

function rowToNote(id: string, row: Record<string, unknown> | null): NoteRow | null {
	if (!row || !row.body) return null;
	return {
		id,
		body: String(row.body),
		tags: parseTags(row.tags),
		createdAt: Number(row.createdAt) || 0,
		updatedAt: Number(row.updatedAt) || 0,
		// Stored as "1"/"0", but Upstash coerces numeric-looking strings back to
		// numbers — compare via String() so a saved draft is not missed.
		draft: String(row.draft ?? '') === '1'
	};
}

export function clampLimit(raw: string | null): number {
	const n = raw ? parseInt(raw, 10) : NaN;
	if (!Number.isFinite(n) || n <= 0) return PAGE_LIMIT_DEFAULT;
	return Math.min(PAGE_LIMIT_MAX, n);
}

export function parseCursor(raw: string | null): number | undefined {
	const n = raw ? parseInt(raw, 10) : NaN;
	return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * One page of the timeline, newest first.
 *
 * The cursor is the `createdAt` of the last note already shown, and the range
 * is exclusive of it, so paging cannot repeat or skip an entry the way an
 * offset would when notes are added mid-scroll.
 */
async function getTimelinePage(cursor: number | undefined, limit: number): Promise<NoteRow[]> {
	if (!redis) return [];
	const max: `(${number}` | '+inf' = cursor && cursor > 0 ? `(${cursor}` : '+inf';
	const ids =
		(await redis.zrange<string[]>(NOTES_INDEX, max, '-inf', {
			byScore: true,
			rev: true,
			offset: 0,
			count: limit
		})) ?? [];
	if (!ids.length) return [];

	const pipeline = redis.pipeline();
	ids.forEach((id) => pipeline.hgetall(NOTE_KEY(id)));
	const rows = (await pipeline.exec<Array<Record<string, unknown> | null>>()) ?? [];

	const notes: NoteRow[] = [];
	rows.forEach((row, i) => {
		const note = rowToNote(ids[i], row);
		if (note) notes.push(note);
	});
	return notes;
}

export interface TimelinePage {
	notes: NoteRow[];
	/** `createdAt` to pass back for the next page, or null when exhausted. */
	nextCursor: number | null;
}

/**
 * A page of public notes, optionally narrowed to one tag.
 *
 * Filtering happens after the fetch because the index is not tag-partitioned,
 * so a narrow tag can empty several pages in a row. The scan is bounded rather
 * than unbounded — worst case it returns short, and the cursor lets the client
 * ask again.
 */
export async function getPublicTimeline(
	cursor: number | undefined,
	limit: number,
	tag?: string | null
): Promise<TimelinePage> {
	const collected: NoteRow[] = [];
	let nextCursor: number | null = cursor ?? null;
	let scans = 0;

	do {
		const page = await getTimelinePage(nextCursor ?? undefined, limit);
		if (!page.length) return { notes: collected, nextCursor: null };

		nextCursor = page[page.length - 1].createdAt;
		for (const note of page) {
			if (note.draft) continue;
			if (tag && !note.tags.includes(tag)) continue;
			collected.push(note);
		}
		// A short page means the index is exhausted, not just filtered out.
		if (page.length < limit) return { notes: collected, nextCursor: null };
		scans += 1;
	} while (collected.length < limit && scans < FILTER_SCAN_PAGES_MAX);

	return { notes: collected.slice(0, limit), nextCursor };
}

export interface TagCount {
	tag: string;
	count: number;
}

/**
 * The most-used tags, by descending count then alphabetical for ties.
 *
 * The bar is a shortcut to what is actually written about, not an index — a
 * full list of every tag ever used is noise at the top of the feed. Rarer tags
 * stay reachable through a note's own hashtags and through ?tag= directly.
 */
export function topTags(notes: NoteRow[], limit: number): TagCount[] {
	const counts = new Map<string, number>();
	for (const note of notes) {
		for (const tag of note.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return Array.from(counts, ([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
		.slice(0, limit);
}
