<script lang="ts">
	import { site } from '$lib/config/site';
	import { runWhenIdle } from '$lib/utils';

	/*
	 * The request that reads the previous location is also the one that records
	 * this visit, so it runs once on mount — but off the critical path. The
	 * footer is the last thing anyone reads, and this was one of the two longest
	 * poles at load while rendering nothing above the fold.
	 */
	let location = $state<string | null>(null);

	$effect(() =>
		runWhenIdle(() => {
			fetch('/api/last-visitor')
				.then((response) => response.json())
				// Cities arrive percent-encoded from the proxy header ("Addis%20Ababa").
				.then((data) => (location = data.location ? decodeURIComponent(data.location) : null))
				.catch(() => (location = null));
		})
	);
</script>

{#if site.show.visitors && location}
	<span class="visitor">Last visitor from {location}</span>
{/if}

<style>
	.visitor {
		display: block;
	}
</style>
