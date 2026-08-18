<script lang="ts">
	import './layout.css';
	import { site } from '$lib/config/site';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content={site.themeColor} />
	<meta name="google-site-verification" content={site.googleSiteVerification} />
	<meta name="related-sites" content={site.relatedSites.join(',')} />
</svelte:head>

{@render children()}
