<script lang="ts">
	import { page } from '$app/state';

	import { site } from '$lib/config/site';

	/*
	 * Counted from the browser rather than during render: the count is the one
	 * thing on a post that changes between two reads of the same page, so
	 * fetching it here keeps the page itself cacheable.
	 */
	let views = $state<number | null>(null);

	$effect(() => {
		const slug = page.url.pathname.replace(/^\//, '');

		fetch(`/api/views/${slug}`, { method: 'POST' })
			.then((response) => response.json())
			.then((counts) => (views = counts.views))
			.catch(() => (views = null));
	});
</script>

<!-- Sits inside the post's meta line, so it brings its own separator and both
	vanish together. Zero is shown once the count has loaded — only a failed or
	in-flight fetch renders nothing, so the number never silently disappears. -->
{#if site.show.postViews && views !== null}
	<span aria-hidden="true">&nbsp;&middot;&nbsp;</span>{views === 1
		? '1 view'
		: `${views.toLocaleString()} views`}
{/if}
