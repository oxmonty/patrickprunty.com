import { toPosts, type PostIndex } from '$lib/posts';
import { absoluteUrl } from '$lib/seo';
import type { RequestHandler } from './$types';

/**
 * Sitemap for the static surface of the site: the four fixed pages plus every
 * post. Prerendered, so it ships as a file rather than running per request.
 */
export const prerender = true;

const PAGES = ['/', '/blog', '/code', '/projects'];

const SECTIONS = [
	{
		section: 'blog',
		modules: import.meta.glob('../blog/*/+page.md', {
			eager: true,
			import: 'metadata'
		}) as PostIndex
	},
	{
		section: 'code',
		modules: import.meta.glob('../code/*/+page.md', {
			eager: true,
			import: 'metadata'
		}) as PostIndex
	}
];

function urlEntry(path: string, lastmod?: string): string {
	return `
	<url>
		<loc>${absoluteUrl(path)}</loc>${lastmod ? `\n\t\t<lastmod>${lastmod}</lastmod>` : ''}
	</url>`;
}

export const GET: RequestHandler = async ({ setHeaders }) => {
	const posts = SECTIONS.flatMap(({ section, modules }) =>
		toPosts(modules).map((post) => urlEntry(`/${section}/${post.slug}`, post.date))
	);

	setHeaders({ 'cache-control': 'public, max-age=3600' });

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${PAGES.map((page) => urlEntry(page)).join('')}${posts.join('')}
</urlset>
`,
		{ headers: { 'content-type': 'application/xml; charset=utf-8' } }
	);
};
