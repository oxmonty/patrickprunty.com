import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

import katex from 'katex';

import { fetchOg } from './og';

/**
 * Renders a note body to HTML on the server.
 *
 * Notes arrive from Redis as markdown strings, and mdsvex is a build-time
 * preprocessor — it cannot compile a string at runtime. So bodies go through
 * marked instead, which means no Svelte components: the embeds below are
 * hand-mapped to plain HTML rather than to <YouTube /> and friends.
 *
 * The output is sanitised even though notes are first-party. The store is
 * reachable by anything holding the token, and this HTML is injected with
 * {@html} — a narrow allowlist is the cheap insurance.
 */

const YOUTUBE_PATTERNS = [
	/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{11})(?:[&#].*)?$/,
	/^https?:\/\/youtu\.be\/([\w-]{11})(?:[?#].*)?$/,
	/^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([\w-]{11})(?:[?#].*)?$/
];

const IMAGE_PATTERN = /^https?:\/\/\S+\.(?:jpe?g|png|gif|webp|avif)(?:\?\S*)?$/i;
const VIDEO_PATTERN = /^https?:\/\/\S+\.(?:mp4|webm|mov)(?:\?\S*)?$/i;

function youTubeId(url: string): string | null {
	for (const re of YOUTUBE_PATTERNS) {
		const m = url.match(re);
		if (m) return m[1];
	}
	return null;
}

function escapeAttr(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Any other standalone URL becomes a link preview card, so a bare link reads as
 * a destination rather than a naked string. If the metadata cannot be read the
 * block is left alone and markdown autolinks it, so the URL is never lost.
 */
async function linkCard(url: string, label?: string): Promise<string> {
	const og = await fetchOg(url);
	if (!og) return label ? `[${label}](${url})` : url;

	const image = og.image
		? `<img class="og-image" src="${escapeAttr(og.image)}" alt="" loading="lazy" />`
		: '';
	const heading = label ?? og.title;
	const title = heading
		? `<span class="og-title">${sanitizeHtml(heading, { allowedTags: [] })}</span>`
		: '';

	return `<figure class="og-card"><a href="${escapeAttr(og.url)}">${image}<span class="og-domain">${escapeAttr(og.domain)}</span>${title}</a></figure>`;
}

/**
 * The markup ZoomImage produces, built as a string.
 *
 * Notes are markdown compiled at runtime, so the component cannot mount here —
 * but the structure can be identical, which means one lightbox implementation
 * serves both surfaces. The button is what makes it reachable by keyboard.
 */
function zoomFigure(src: string, alt: string): string {
	const label = alt ? `Enlarge: ${alt}` : 'Enlarge image';
	return `<figure class="media-aside"><button type="button" class="zoom" aria-label="${escapeAttr(label)}"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" /></button></figure>`;
}

/** Reads an attribute from a JSX-ish tag, accepting either quote style. */
function attr(tag: string, name: string): string | null {
	return tag.match(new RegExp(`${name}=["']([^"']*)["']`))?.[1] ?? null;
}

/**
 * Translates v1's MDX components into HTML.
 *
 * Note bodies were authored for a runtime-MDX pipeline, so they contain real
 * components rather than markdown. marked passes unknown tags through as raw
 * HTML and does not parse markdown inside them, which is why these rendered as
 * literal source text. Each one maps to the nearest plain-HTML equivalent.
 */
function translateComponents(markdown: string): string {
	return (
		markdown
			// Grid and caption wrappers are layout only.
			.replace(/<\/?CambioGrid[^>]*>/g, '')
			.replace(/<CambioImage\b([\s\S]*?)\/>/g, (_, body) => {
				const src = attr(body, 'src');
				if (!src) return '';
				return zoomFigure(src, attr(body, 'alt') ?? '');
			})
			.replace(/<MP4\b([\s\S]*?)\/>/g, (_, body) => {
				const src = attr(body, 'src');
				if (!src) return '';
				return `<figure class="media-aside"><video src="${escapeAttr(src)}" controls playsinline muted loop preload="metadata"></video></figure>`;
			})
			.replace(/<XCard\b([\s\S]*?)\/>/g, (_, body) => {
				const id = attr(body, 'id');
				if (!id) return '';
				return `<div class="embed"><iframe src="https://platform.twitter.com/embed/Tweet.html?id=${encodeURIComponent(id)}&dnt=true" title="Post on X" loading="lazy"></iframe></div>`;
			})
			.replace(/<Latex\b([\s\S]*?)\/>/g, (_, body) => {
				const math = attr(body, 'math');
				if (!math) return '';
				const block = /\bblock\b/.test(body);
				return katex.renderToString(math, { displayMode: block, throwOnError: false });
			})
			// Caption keeps its inline markdown, so a link inside stays a link.
			.replace(/<Caption\b[^>]*>([\s\S]*?)<\/Caption>/g, (_, inner) => {
				const text = marked.parseInline(inner.trim(), { async: false }) as string;
				return `<figcaption class="note-caption">${text}</figcaption>`;
			})
	);
}

/** Rewrites a bare URL on its own line into an embed, mirroring remark-auto-embed. */
async function expandEmbeds(markdown: string): Promise<string> {
	const blocks = markdown.split(/\n{2,}/);

	// Fetched in parallel: a note with several links should not pay for them
	// one after another.
	return (
		await Promise.all(
			blocks.map(async (block) => {
				// Strip any raw HTML wrapper so a link written inside <div>/<caption>
				// is treated the same as one written bare.
				const bare = block.replace(/<\/?(?:div|caption|figure|p)\b[^>]*>/g, '').trim();

				const link = bare.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
				if (link) return linkCard(link[2], link[1]);

				const url = bare;
				if (!/^https?:\/\/\S+$/.test(url)) return block;

				const id = youTubeId(url);
				if (id) {
					return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`;
				}
				if (VIDEO_PATTERN.test(url)) {
					return `<figure class="media-aside"><video src="${escapeAttr(url)}" controls playsinline preload="metadata"></video></figure>`;
				}
				if (IMAGE_PATTERN.test(url)) {
					return zoomFigure(url, '');
				}
				return linkCard(url);
			})
		)
	).join('\n\n');
}

/**
 * Markdown image syntax renders an inline <img> inside a paragraph, and a
 * paragraph is capped at the text column — so the image would float within the
 * text instead of the right column. Lift an image-only paragraph into a figure,
 * the same unwrap remark-auto-embed does for the build-time pipeline.
 */
function liftImageParagraphs(html: string): string {
	return html.replace(/<p>\s*<img\b([^>]*)>\s*<\/p>/g, (_, attrs) => {
		const src = attrs.match(/src=["']([^"']*)["']/)?.[1] ?? '';
		const alt = attrs.match(/alt=["']([^"']*)["']/)?.[1] ?? '';
		return src ? zoomFigure(src, alt) : '';
	});
}

export async function renderNote(body: string): Promise<string> {
	const html = liftImageParagraphs(
		marked.parse(await expandEmbeds(translateComponents(body)), { async: false }) as string
	);

	return sanitizeHtml(html, {
		allowedTags: [
			...sanitizeHtml.defaults.allowedTags,
			'img',
			'video',
			'iframe',
			'figure',
			'figcaption',
			'button'
		],
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			a: ['href', 'name', 'target', 'rel', 'class'],
			img: ['src', 'alt', 'loading', 'class'],
			span: ['class'],
			figure: ['class'],
			figcaption: ['class'],
			button: ['type', 'class', 'aria-label'],
			video: ['src', 'controls', 'playsinline', 'preload', 'muted', 'loop'],
			iframe: ['src', 'title', 'loading', 'allowfullscreen'],
			div: ['class']
		},
		// A fixed host list, not a free-for-all: an arbitrary iframe src would be
		// an open redirect into someone else's page inside our chrome.
		allowedIframeHostnames: ['www.youtube-nocookie.com', 'platform.twitter.com'],
		transformTags: {
			// Notes link off-site by nature, so every link leaves safely.
			a: (tagName, attribs) => ({
				tagName,
				attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
			})
		}
	});
}
