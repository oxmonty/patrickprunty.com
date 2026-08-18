import { json } from '@sveltejs/kit';

import { clampLimit, getPublicTimeline, parseCursor } from '$lib/server/notes-store';
import { renderNote } from '$lib/server/render-note';
import type { RequestHandler } from './$types';

/** Feeds the client's lazy loading; the first page comes from the page load. */
export const GET: RequestHandler = async ({ url }) => {
	const cursor = parseCursor(url.searchParams.get('cursor'));
	const limit = clampLimit(url.searchParams.get('limit'));
	const tag = url.searchParams.get('tag')?.trim().toLowerCase() || null;

	const page = await getPublicTimeline(cursor, limit, tag);

	return json({
		nextCursor: page.nextCursor,
		notes: await Promise.all(
			page.notes.map(async (note) => ({
				id: note.id,
				html: await renderNote(note.body),
				tags: note.tags,
				createdAt: note.createdAt
			}))
		)
	});
};
