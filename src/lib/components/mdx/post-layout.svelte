<script module lang="ts">
	// Element overrides are per-layout in mdsvex, so this repeats the default
	// layout's registry. The component registry itself is injected by the
	// preprocessor and needs nothing here.
	export { default as img } from './zoom-image.svelte';
	export { default as code } from './inline-code.svelte';
	export { default as CodeBlock } from './code-block.svelte';
</script>

<script lang="ts">
	import { page } from '$app/state';

	import EditorialPage from '$lib/components/editorial-page.svelte';
	import Seo from '$lib/components/seo.svelte';

	// Frontmatter arrives as props; the rest of it (description, date) is read by
	// the index loader, not rendered here.
	let {
		children,
		title,
		description,
		date,
		image
	}: {
		children: import('svelte').Snippet;
		title?: string;
		description?: string;
		date?: string;
		image?: string;
	} = $props();
</script>

<Seo {title} {description} {image} path={page.url.pathname} type="article" publishedTime={date} />

<EditorialPage>
	<article>
		<div class="article-intro">
			<h2>{title}</h2>
		</div>

		<div class="prose-editorial prose max-w-none prose-neutral dark:prose-invert">
			{@render children()}
		</div>
	</article>
</EditorialPage>
