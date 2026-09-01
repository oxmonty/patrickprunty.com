<script lang="ts">
	import { site } from '$lib/config/site';
	import { buildSeo, type SeoInput } from '$lib/seo';

	let { ...input }: SeoInput = $props();

	const seo = $derived(buildSeo(input));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonical} />
	{#if seo.keywords.length}
		<meta name="keywords" content={seo.keywords.join(', ')} />
	{/if}
	{#each seo.authors as author (author)}
		<meta name="author" content={author} />
	{/each}
	{#if seo.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<meta property="og:type" content={seo.type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content={site.locale} />
	<meta property="og:url" content={seo.canonical} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content={seo.image} />
	<!--
		Only the generated card has dimensions we can state. A frontmatter image is
		whatever shape the author linked, and declaring the wrong size makes
		scrapers reserve the wrong box for it.
	-->
	{#if seo.generatedImage}
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
	<meta property="og:image:alt" content={seo.title} />
	{#if seo.type === 'article'}
		{#if seo.publishedTime}
			<meta property="article:published_time" content={seo.publishedTime} />
		{/if}
		{#if seo.modifiedTime}
			<meta property="article:modified_time" content={seo.modifiedTime} />
		{/if}
		{#each seo.authors as author (author)}
			<meta property="article:author" content={author} />
		{/each}
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={site.author.twitter} />
	<meta name="twitter:creator" content={site.author.twitter} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.image} />
	<meta name="twitter:image:alt" content={seo.title} />
</svelte:head>
