import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';

import { redisPipeline, toClientIp } from '$lib/server/redis';

import type { RequestHandler } from './$types';

/**
 * Per-post counters, keyed the way the previous Next.js site keyed them —
 * `views:blog/<slug>` and `unique-viewers:blog/<slug>` — so pointing this at
 * the same Upstash database continues the existing counts rather than
 * restarting them. The `[...slug]` rest param is the post's path minus its
 * leading slash, which makes /code posts fall into the same scheme.
 */
const toKeys = (slug: string) => ({
	views: `views:${slug}`,
	unique: `unique-viewers:${slug}`
});

const toCount = (value: unknown): number => {
	const count = typeof value === 'string' ? parseInt(value, 10) : value;
	return typeof count === 'number' && Number.isFinite(count) ? count : 0;
};

async function readCounts(slug: string) {
	const keys = toKeys(slug);
	const results = await redisPipeline([
		['GET', keys.views],
		['HLEN', keys.unique]
	]);

	if (!results) return { views: 0, uniqueViewers: 0 };

	return { views: toCount(results[0]), uniqueViewers: toCount(results[1]) };
}

export const GET: RequestHandler = async ({ params }) => json(await readCounts(params.slug));

export const POST: RequestHandler = async ({ params, request, getClientAddress }) => {
	const keys = toKeys(params.slug);

	// Reading a post locally shouldn't move the live counters, so dev only reads.
	if (dev) return json(await readCounts(params.slug));

	const results = await redisPipeline([
		['INCR', keys.views],
		['HINCRBY', keys.unique, toClientIp(request, getClientAddress()), 1],
		['HLEN', keys.unique]
	]);

	if (!results) return json({ views: 0, uniqueViewers: 0 });

	return json({ views: toCount(results[0]), uniqueViewers: toCount(results[2]) });
};
