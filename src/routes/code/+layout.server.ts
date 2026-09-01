import { toPosts } from '$lib/posts';
import type { LayoutServerLoad } from './$types';

/**
 * The section's post list, loaded on the layout rather than the page so a post
 * itself can read it too — that is what the "next up" block at the foot of
 * every post navigates with.
 *
 * Server-side rather than universal: the glob resolves to every post module in
 * the section, so running it on the client would put all of their compiled
 * bodies in the bundle behind the listing. Here the client is sent only the
 * frontmatter it renders.
 */
export const load: LayoutServerLoad = async () => ({
	posts: toPosts(import.meta.glob('./*/+page.md', { eager: true, import: 'metadata' }))
});
