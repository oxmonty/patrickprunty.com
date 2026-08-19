import { toPosts } from '$lib/posts';
import type { LayoutLoad } from './$types';

/**
 * The section's post list, loaded on the layout rather than the page so a post
 * itself can read it too — that is what the "next up" block at the foot of
 * every post navigates with.
 */
export const load: LayoutLoad = async () => ({
	posts: toPosts(import.meta.glob('./*/+page.md', { eager: true }))
});
