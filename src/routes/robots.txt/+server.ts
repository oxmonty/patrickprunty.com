import { absoluteUrl } from '$lib/seo';
import type { RequestHandler } from './$types';

/**
 * A route rather than a file in static/, because the Sitemap line has to be an
 * absolute URL and robots.txt has no way to resolve one. Served from the same
 * origin every other canonical address is built from, so it cannot name a
 * domain the rest of the site has moved off.
 */
export const prerender = true;

export const GET: RequestHandler = async () => {
	const body = `# allow crawling everything by default
User-agent: *
Disallow:

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
