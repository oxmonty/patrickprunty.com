import { buildRssFeed, type FeedItem } from '$lib/rss';
import { toPosts, type PostFrontmatter } from '$lib/posts';
import type { RequestHandler } from './$types';

/**
 * One feed for the whole site rather than one per section: a reader subscribes
 * once and filters on <category> if they only want half of it.
 *
 * Prerendered, so it is a static file in production and never runs per request.
 */
export const prerender = true;

type PostModules = Record<string, { metadata?: PostFrontmatter }>;

const SECTIONS = [
	{
		section: 'blog',
		category: 'Blog',
		modules: import.meta.glob('../blog/*/+page.md', { eager: true }) as PostModules
	},
	{
		section: 'code',
		category: 'Code',
		modules: import.meta.glob('../code/*/+page.md', { eager: true }) as PostModules
	}
];

export const GET: RequestHandler = async ({ setHeaders }) => {
	const items: FeedItem[] = SECTIONS.flatMap(({ section, category, modules }) =>
		toPosts(modules).map((post) => ({ ...post, section, category }))
	).sort((a, b) => b.date.localeCompare(a.date));

	setHeaders({ 'cache-control': 'public, max-age=3600' });

	return new Response(buildRssFeed(items, '/rss.xml'), {
		headers: { 'content-type': 'application/rss+xml; charset=utf-8' }
	});
};
