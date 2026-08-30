import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';

import { redisPipeline } from '$lib/server/redis';

import type { RequestHandler } from './$types';

/**
 * Where the previous visitor was, kept as a three-deep chain of plain keys —
 * the same `last-`/`second-last-`/`third-last-visitor-*` keys the Next.js site
 * wrote, so the chain simply carries on.
 *
 * Reading the third-last rather than the last is the point of the chain: the
 * visitor being shown a location should never be shown their own, and a reload
 * or a prefetch would otherwise make them the most recent entry.
 */
const locationKey = (position: string) => `${position}-visitor-location`;
const timestampKey = (position: string) => `${position}-visitor-timestamp`;

/**
 * Vercel's geo headers first, Cloudflare's as the fallback, matching what the
 * old site read. Both are set by the proxy, never by the client.
 */
function toLocation(request: Request): string | null {
	const city = request.headers.get('x-vercel-ip-city') ?? request.headers.get('cf-ipcity');
	const country = request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry');
	if (!city || !country) return null;

	const region = request.headers.get('x-vercel-ip-country-region');
	return region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
}

const toText = (value: unknown) => (typeof value === 'string' && value ? value : null);

export const GET: RequestHandler = async ({ request }) => {
	const [last, lastAt, secondLast, secondLastAt, thirdLast] =
		(await redisPipeline([
			['GET', locationKey('last')],
			['GET', timestampKey('last')],
			['GET', locationKey('second-last')],
			['GET', timestampKey('second-last')],
			['GET', locationKey('third-last')]
		])) ?? [];

	const location = toLocation(request);

	// ponytail: read-then-write, so two visitors landing at once can lose an
	// entry from the chain. Harmless for a footer curiosity; a Lua script or a
	// list with LPUSH/LTRIM would make it atomic if it ever mattered.
	if (location && !dev) {
		const shifts = [];

		// Each entry moves one step down the chain before the new one goes on top.
		if (toText(secondLast) && toText(secondLastAt)) {
			shifts.push(['SET', locationKey('third-last'), secondLast as string]);
			shifts.push(['SET', timestampKey('third-last'), secondLastAt as string]);
		}
		if (toText(last) && toText(lastAt)) {
			shifts.push(['SET', locationKey('second-last'), last as string]);
			shifts.push(['SET', timestampKey('second-last'), lastAt as string]);
		}

		await redisPipeline([
			...shifts,
			['SET', locationKey('last'), location],
			['SET', timestampKey('last'), String(Date.now())]
		]);
	}

	return json({ location: toText(thirdLast) });
};
