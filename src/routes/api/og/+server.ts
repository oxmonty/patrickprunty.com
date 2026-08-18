import { error, json } from '@sveltejs/kit';

import { fetchOg, parsePublicUrl } from '$lib/server/og';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const target = url.searchParams.get('url');
	if (!target) error(400, 'Missing url parameter');
	if (!parsePublicUrl(target)) error(400, 'Only http(s) urls are supported');

	const data = await fetchOg(target);
	if (!data) error(502, 'Could not read the target url');

	return json(data);
};
