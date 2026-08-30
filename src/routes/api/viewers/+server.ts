import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';

import { redisPipeline, toClientIp } from '$lib/server/redis';

import type { RequestHandler } from './$types';

/**
 * Site-wide unique visitors, counted as the number of distinct addresses in one
 * hash. The previous site's footer always asked for `path=/` no matter which
 * page it was on, so `unique-viewers:/` is the running total for the whole
 * site; keeping that default is what continues the existing count.
 */
export const GET: RequestHandler = async ({ url, request, getClientAddress }) => {
	const key = `unique-viewers:${url.searchParams.get('path') || '/'}`;

	// Browsing locally shouldn't move the live count, so dev only reads.
	const commands = dev
		? [['HLEN', key]]
		: [
				['HINCRBY', key, toClientIp(request, getClientAddress()), 1],
				['HLEN', key]
			];

	const results = await redisPipeline(commands);
	const count = results?.at(-1);

	return json({ count: typeof count === 'number' ? count : 0 });
};
