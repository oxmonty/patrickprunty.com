<script lang="ts">
	import { site } from '$lib/config/site';

	/*
	 * The request that reads the previous location is also the one that records
	 * this visit, so it runs once on mount.
	 */
	let location = $state<string | null>(null);

	$effect(() => {
		fetch('/api/last-visitor')
			.then((response) => response.json())
			// Cities arrive percent-encoded from the proxy header ("Addis%20Ababa").
			.then((data) => (location = data.location ? decodeURIComponent(data.location) : null))
			.catch(() => (location = null));
	});
</script>

{#if site.show.visitors && location}
	<span class="visitor">Last visitor from {location}</span>
{/if}

<style>
	.visitor {
		display: block;
	}
</style>
