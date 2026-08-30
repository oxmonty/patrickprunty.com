import { error } from '@sveltejs/kit';

import { PAGES } from '$lib/config/pages';
import { site } from '$lib/config/site';
import { toPosts, type PostFrontmatter } from '$lib/posts';
import { renderOgCard } from '$lib/server/og-card';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * One OpenGraph card per page, drawn at build time.
 *
 * Prerendered rather than served per request: an unfurler gets a static PNG
 * with no render latency, a broken card fails the build instead of a share,
 * and satori and resvg never run in production.
 *
 * The path mirrors the page it belongs to — /og/blog/why-travel.png for
 * /blog/why-travel — with 'home' standing in for the site root, which has no
 * segment of its own. `ogPath` in $lib/seo builds the same address.
 */
export const prerender = true;

type PostModules = Record<string, { metadata?: PostFrontmatter }>;

const SECTIONS = [
	{
		section: 'blog',
		modules: import.meta.glob('../../blog/*/+page.md', { eager: true }) as PostModules
	},
	{
		section: 'code',
		modules: import.meta.glob('../../code/*/+page.md', { eager: true }) as PostModules
	}
];

/** Every card the site needs, keyed by the same path segment `ogPath` emits. */
function cards(): Map<string, { title: string; description: string }> {
	const entries = new Map<string, { title: string; description: string }>();

	for (const page of PAGES) {
		entries.set(page.path === '/' ? 'home' : page.path.slice(1), {
			title: page.title ?? site.name,
			description: page.description
		});
	}

	for (const { section, modules } of SECTIONS) {
		for (const post of toPosts(modules)) {
			entries.set(`${section}/${post.slug}`, {
				title: post.title,
				description: post.description
			});
		}
	}

	return entries;
}

export const entries: EntryGenerator = () => [...cards().keys()].map((path) => ({ path }));

export const GET: RequestHandler = async ({ params }) => {
	const card = cards().get(params.path);
	if (!card) error(404, 'No card for that page');

	const png = await renderOgCard(card.title, card.description);

	return new Response(png, {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=604800, immutable'
		}
	});
};
