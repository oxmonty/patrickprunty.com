/** A note as it reaches the client: body already rendered to sanitised HTML. */
export interface Note {
	id: string;
	html: string;
	tags: string[];
	createdAt: number;
}

export interface DayGroup {
	/** UTC YYYY-MM-DD. */
	day: string;
	notes: Note[];
}

export function dayKey(ms: number): string {
	return new Date(ms).toISOString().slice(0, 10);
}

export function prettyDay(yyyyMmDd: string): string {
	const [y, m, d] = yyyyMmDd.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
}

/** Groups an already-sorted (newest first) list by UTC day, preserving order. */
export function groupByDay(notes: Note[]): DayGroup[] {
	const groups = new Map<string, Note[]>();
	for (const note of notes) {
		const key = dayKey(note.createdAt);
		const existing = groups.get(key);
		if (existing) existing.push(note);
		else groups.set(key, [note]);
	}
	return Array.from(groups, ([day, dayNotes]) => ({ day, notes: dayNotes }));
}
