import { dev } from '$app/environment';

export interface PostFrontmatter {
	title?: string;
	description?: string;
	date?: string;
	image?: string;
	draft?: boolean;
}

export interface Post {
	slug: string;
	title: string;
	description: string;
	date: string;
	/** Shown on title hover in the listing, not inline. */
	image?: string;
	/** Only ever true in dev: the filter below drops drafts in a build. */
	draft?: boolean;
}

/**
 * What `import.meta.glob('<pattern>', { eager: true, import: 'metadata' })`
 * returns: each post's frontmatter, keyed by file path.
 *
 * The `import` option is what keeps this cheap. Without it the glob pulls in
 * every post's compiled component, so a listing route that only needs titles
 * ships every body it lists — including the drafts it then filters out.
 */
export type PostIndex = Record<string, PostFrontmatter | undefined>;

/**
 * Normalises a post index into a sorted post list.
 *
 * The glob itself has to stay in each route — Vite requires a literal pattern
 * it can statically analyse — so only the shaping is shared.
 */
export function toPosts(index: PostIndex): Post[] {
	return (
		Object.entries(index)
			.map(([path, frontmatter]) => ({
				// The directory the file sits in, so the same helper serves a route's own
				// './<slug>/+page.md' glob and a cross-route '../blog/<slug>/+page.md' one.
				slug: path.split('/').at(-2) ?? '',
				title: frontmatter?.title ?? 'Untitled',
				description: frontmatter?.description ?? '',
				date: frontmatter?.date ?? '',
				image: frontmatter?.image,
				draft: frontmatter?.draft ?? false
			}))
			// Drafts stay visible while developing so they can be read in the listing.
			.filter((post) => dev || !post.draft)
			.sort((a, b) => b.date.localeCompare(a.date))
	);
}
