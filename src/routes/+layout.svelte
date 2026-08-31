<script lang="ts">
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	import './layout.css';
	import { site } from '$lib/config/site';

	let { children } = $props();

	// Loads the script and reports each navigation. `mode` defaults to auto, so a
	// dev run logs to the console instead of sending anything.
	injectAnalytics();
</script>

<svelte:head>
	<meta name="theme-color" content={site.themeColor} />
	<meta name="google-site-verification" content={site.googleSiteVerification} />
	<meta name="related-sites" content={site.relatedSites.join(',')} />
</svelte:head>

{@render children()}
