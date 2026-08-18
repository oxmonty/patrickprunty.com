export interface OgData {
	title: string | null;
	description: string | null;
	image: string | null;
	domain: string;
	url: string;
}

/**
 * ponytail: in-process cache. It resets on deploy and is per-instance — move to
 * a shared store if link cards ever land on a hot path.
 */
const cache = new Map<string, OgData | null>();

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 512 * 1024;

function decodeEntities(value: string): string {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function metaContent(html: string, property: string): string | null {
	const tag = html.match(
		new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*>`, 'i')
	)?.[0];
	if (!tag) return null;
	const content = tag.match(/content=["']([^"']*)["']/i)?.[1];
	return content ? decodeEntities(content) : null;
}

/** Only public http(s) origins — anything else could reach an internal host. */
export function parsePublicUrl(raw: string): URL | null {
	try {
		const url = new URL(raw);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
	} catch {
		return null;
	}
}

/** Open Graph metadata for a URL, or null when it cannot be read. */
export async function fetchOg(raw: string): Promise<OgData | null> {
	const parsed = parsePublicUrl(raw);
	if (!parsed) return null;

	if (cache.has(parsed.href)) return cache.get(parsed.href) ?? null;

	let html: string;
	try {
		const response = await fetch(parsed.href, {
			headers: { accept: 'text/html', 'user-agent': 'patrickprunty.com link preview' },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
		});
		if (!response.ok) throw new Error(String(response.status));
		html = (await response.text()).slice(0, MAX_BYTES);
	} catch {
		// Cache the failure too, so a dead link is not re-fetched on every render.
		cache.set(parsed.href, null);
		return null;
	}

	const data: OgData = {
		title:
			metaContent(html, 'og:title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null,
		description: metaContent(html, 'og:description') ?? metaContent(html, 'description'),
		image: metaContent(html, 'og:image'),
		domain: parsed.hostname.replace(/^www\./, ''),
		url: parsed.href
	};

	cache.set(parsed.href, data);
	return data;
}
