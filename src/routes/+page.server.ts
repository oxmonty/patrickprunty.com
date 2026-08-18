import { getPublicTimeline, PAGE_LIMIT_DEFAULT, topTags } from '$lib/server/notes-store';
import { renderNote } from '$lib/server/render-note';
import type { PageServerLoad } from './$types';

/** Bounded: the tag list only needs the recent past, not the whole archive. */
const TAG_SCAN_LIMIT = 50;
const TOP_TAGS = 7;

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const tag = url.searchParams.get('tag')?.trim().toLowerCase() || null;

	const [page, recent] = await Promise.all([
		getPublicTimeline(undefined, PAGE_LIMIT_DEFAULT, tag),
		getPublicTimeline(undefined, TAG_SCAN_LIMIT, null)
	]);

	// Notes change rarely; let a shared cache carry the load off Redis.
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600' });

	return {
		tag,
		// An active filter stays visible even when it falls outside the top seven,
		// or selecting a rare tag would blank the control that set it.
		// The selected tag leads the bar, and stays visible even when it falls
		// outside the top seven — otherwise picking a rare tag would blank the
		// control that set it.
		tags: (() => {
			const top = topTags(recent.notes, TOP_TAGS);
			if (!tag) return top;
			const active = top.find((t) => t.tag === tag) ?? {
				tag,
				count: recent.notes.filter((note) => note.tags.includes(tag)).length
			};
			return [active, ...top.filter((t) => t.tag !== tag)];
		})(),
		nextCursor: page.nextCursor,
		notes: await Promise.all(
			page.notes.map(async (note) => ({
				id: note.id,
				html: await renderNote(note.body),
				tags: note.tags,
				createdAt: note.createdAt
			}))
		)
	};
};
