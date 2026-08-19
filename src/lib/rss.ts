import { site } from '$lib/config/site';
import { absoluteUrl } from '$lib/seo';
import type { Post } from '$lib/posts';

/** A post plus the section it was published under, which becomes its category. */
export interface FeedItem extends Post {
	/** Route segment: 'blog' or 'code'. */
	section: string;
	/** Human label used for <category>. */
	category: string;
}

const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => ESCAPES[character]);
}

/**
 * RFC 822, which is what RSS 2.0 requires — `toUTCString()` emits exactly that
 * form. Frontmatter dates are plain `YYYY-MM-DD`, so they land at midnight UTC.
 */
function toRfc822(date: string): string {
	const parsed = new Date(date);
	return isNaN(parsed.valueOf()) ? new Date(0).toUTCString() : parsed.toUTCString();
}

function toItem(item: FeedItem): string {
	const link = absoluteUrl(`/${item.section}/${item.slug}`);

	return `
		<item>
			<title>${escapeXml(item.title)}</title>
			<link>${escapeXml(link)}</link>
			<guid isPermaLink="true">${escapeXml(link)}</guid>
			<description>${escapeXml(item.description)}</description>
			<category>${escapeXml(item.category)}</category>
			<pubDate>${toRfc822(item.date)}</pubDate>
			<dc:creator>${escapeXml(site.author.name)}</dc:creator>${
				item.image
					? `\n\t\t\t<media:content url="${escapeXml(absoluteUrl(item.image))}" medium="image" type="${mimeType(item.image)}" />`
					: ''
			}
		</item>`;
}

/** media:content wants a MIME type; the extension is all the feed has to go on. */
function mimeType(path: string): string {
	const extension = path.split('.').pop()?.toLowerCase();
	if (extension === 'png') return 'image/png';
	if (extension === 'webp') return 'image/webp';
	if (extension === 'gif') return 'image/gif';
	return 'image/jpeg';
}

/**
 * RSS 2.0 document for the whole site, one item per post, categorised by the
 * section it lives under so a reader can filter Blog from Code.
 *
 * `atom:self` is the canonical address of the feed itself, which validators
 * require and some readers use to follow a move.
 */
export function buildRssFeed(items: FeedItem[], feedPath: string): string {
	const self = absoluteUrl(feedPath);
	const latest = items[0]?.date;

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
	<channel>
		<title>${escapeXml(site.name)}</title>
		<link>${escapeXml(site.url)}</link>
		<description>${escapeXml(site.description)}</description>
		<language>${escapeXml(site.locale.replace('_', '-'))}</language>
		<copyright>© ${new Date().getFullYear()} ${escapeXml(site.author.name)}</copyright>
		<managingEditor>${escapeXml(site.author.email)} (${escapeXml(site.author.name)})</managingEditor>
		<webMaster>${escapeXml(site.author.email)} (${escapeXml(site.author.name)})</webMaster>
		<lastBuildDate>${toRfc822(latest ?? new Date().toISOString())}</lastBuildDate>
		<atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />${items
			.map(toItem)
			.join('')}
	</channel>
</rss>
`;
}
