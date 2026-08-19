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
}

type PostModules = Record<string, { metadata?: PostFrontmatter }>;

/**
 * Normalises an `import.meta.glob('./<em>/+page.md', { eager: true })` result into
 * a sorted post list.
 *
 * The glob itself has to stay in each route — Vite requires a literal pattern
 * it can statically analyse — so only the shaping is shared.
 */
export function toPosts(modules: PostModules): Post[] {
	return Object.entries(modules)
		.map(([path, module]) => ({
			// The directory the file sits in, so the same helper serves a route's own
			// './<slug>/+page.md' glob and a cross-route '../blog/<slug>/+page.md' one.
			slug: path.split('/').at(-2) ?? '',
			title: module.metadata?.title ?? 'Untitled',
			description: module.metadata?.description ?? '',
			date: module.metadata?.date ?? '',
			image: module.metadata?.image,
			draft: module.metadata?.draft ?? false
		}))
		.filter((post) => !post.draft)
		.sort((a, b) => b.date.localeCompare(a.date))
		.map(({ slug, title, description, date, image }) => ({
			slug,
			title,
			description,
			date,
			image
		}));
}
