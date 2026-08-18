import { toPosts } from '$lib/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({
	posts: toPosts(import.meta.glob('./*/+page.md', { eager: true }))
});
