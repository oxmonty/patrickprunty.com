<script lang="ts">
	import { site } from '$lib/config/site';

	/*
	 * The request that reads the count is also the one that records this visit,
	 * so it runs once on mount and is deliberately not tied to the current page.
	 */
	let count = $state<number | null>(null);

	$effect(() => {
		fetch('/api/viewers?path=/')
			.then((response) => response.json())
			.then((data) => (count = data.count))
			.catch(() => (count = null));
	});
</script>

{#if site.show.visitors && count !== null && count > 0}
	<span class="visitors">{count.toLocaleString()} unique visitors</span>
{/if}

<style>
	.visitors {
		display: block;
	}
</style>
