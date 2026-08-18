import { visit } from 'unist-util-visit';

/**
 * Turns a bare URL on its own line into the matching embed component.
 *
 * Ported from patrickprunty.com v1. The one behavioural difference: mdsvex has
 * no MDX JSX node type, so matches are emitted as raw `html` nodes containing a
 * Svelte component tag. mdsvex passes those through to the compiler, which
 * resolves the capitalised tag against whatever is in scope — the mdx layout's
 * module exports.
 */

const YOUTUBE_PATTERNS = [
	/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{11})(?:[&#].*)?$/,
	/^https?:\/\/youtu\.be\/([\w-]{11})(?:[?#].*)?$/,
	/^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([\w-]{11})(?:[?#].*)?$/,
	/^https?:\/\/(?:www\.|m\.)?youtube\.com\/embed\/([\w-]{11})(?:[?#].*)?$/
];

const IMAGE_PATTERN = /^https?:\/\/\S+\.(?:jpe?g|png|gif|webp|avif)(?:\?\S*)?$/i;

const VIDEO_PATTERN = /^https?:\/\/\S+\.(?:mp4|webm|mov)(?:\?\S*)?$/i;

const AUDIO_PATTERN = /^https?:\/\/\S+\.(?:mp3|m4a|wav|ogg)(?:\?\S*)?$/i;

const SPOTIFY_PATTERN =
	/^https?:\/\/open\.spotify\.com\/(track|playlist|album|episode|show)\/([A-Za-z0-9]+)(?:[?#].*)?$/;

const X_PATTERNS = [
	/^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/(\d+)(?:[?#].*)?$/
];

/** @param {string} url */
function extractYouTubeId(url) {
	for (const re of YOUTUBE_PATTERNS) {
		const m = url.match(re);
		if (m) return m[1];
	}
	return null;
}

/** @param {string} url */
function extractSpotify(url) {
	const m = url.match(SPOTIFY_PATTERN);
	if (!m) return null;
	return { type: m[1], id: m[2] };
}

/** @param {string} url */
function extractTweetId(url) {
	for (const re of X_PATTERNS) {
		const m = url.match(re);
		if (m) return m[1];
	}
	return null;
}

/**
 * A paragraph counts as a standalone URL when it holds nothing but that URL,
 * either as bare text or as a link whose label is its own href (what most
 * editors autolink to).
 */
/** @param {any} node */
function getStandaloneUrl(node) {
	if (node.children.length !== 1) return null;
	const child = node.children[0];
	if (child.type === 'text') {
		const trimmed = child.value.trim();
		return /^https?:\/\/\S+$/.test(trimmed) ? trimmed : null;
	}
	if (child.type === 'link') {
		if (child.children.length !== 1) return null;
		const inner = child.children[0];
		if (inner.type !== 'text') return null;
		return inner.value.trim() === child.url ? child.url : null;
	}
	return null;
}

/** @param {string} value */
function attr(value) {
	return String(value).replace(/"/g, '&quot;');
}

/**
 * @param {string} name
 * @param {Record<string, string>} attrs
 */
function component(name, attrs) {
	const rendered = Object.entries(attrs)
		.map(([key, value]) => `${key}="${attr(value)}"`)
		.join(' ');
	return { type: 'html', value: `<${name} ${rendered} />` };
}

export function remarkAutoEmbed() {
	return (/** @type {any} */ tree) => {
		visit(tree, 'paragraph', (node, index, parent) => {
			if (!parent || typeof index !== 'number') return;

			// `![alt](src)` parses to a paragraph wrapping an image, but the img
			// override renders a <figure> and a <dialog> — block elements that a
			// browser cannot keep inside a <p>. It reparents them, the SSR and
			// client trees diverge, and hydration throws HierarchyRequestError.
			// Lifting the image out of its paragraph keeps the markup valid.
			if (node.children.length === 1 && node.children[0].type === 'image') {
				parent.children[index] = node.children[0];
				return;
			}

			const url = getStandaloneUrl(node);
			if (!url) return;

			const youTubeId = extractYouTubeId(url);
			if (youTubeId) {
				parent.children[index] = component('YouTube', { videoId: youTubeId });
				return;
			}

			const spotify = extractSpotify(url);
			if (spotify) {
				parent.children[index] = component('Spotify', { id: spotify.id, type: spotify.type });
				return;
			}

			const tweetId = extractTweetId(url);
			if (tweetId) {
				parent.children[index] = component('XCard', { id: tweetId });
				return;
			}

			if (VIDEO_PATTERN.test(url)) {
				parent.children[index] = component('MP4', { src: url });
				return;
			}

			if (AUDIO_PATTERN.test(url)) {
				parent.children[index] = component('MP3', { src: url });
				return;
			}

			if (IMAGE_PATTERN.test(url)) {
				parent.children[index] = component('ZoomImage', { src: url, alt: '' });
				return;
			}

			// Fallback: any other standalone http(s) URL becomes an OG link card.
			parent.children[index] = component('OgCard', { url });
		});
	};
}
