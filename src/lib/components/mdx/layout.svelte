<script module lang="ts">
	// mdsvex injects this layout's module exports into every markdown file's
	// scope, so authors get the whole registry without importing anything, and
	// remark-auto-embed can emit component tags that resolve here.
	export { default as img } from './zoom-image.svelte';
	export { default as code } from './inline-code.svelte';

	export { default as CodeBlock } from './code-block.svelte';

	export { default as YouTube } from './youtube.svelte';
	export { default as MP4 } from './mp4.svelte';
	export { default as MP3 } from './mp3.svelte';
	export { default as Spotify } from './spotify.svelte';
	export { default as XCard } from './x-card.svelte';
	export { default as OgCard } from './og-card.svelte';
	export { default as ZoomImage } from './zoom-image.svelte';

	export { default as Callout } from './callout.svelte';
	export { default as FootNotes } from './footnotes.svelte';
	export { default as FootNote } from './foot-note.svelte';
	export { default as Ref } from './ref.svelte';
	export { default as Latex } from './latex.svelte';
	export { default as LargeInlineMath } from './large-inline-math.svelte';
	export { default as LargeBlockMath } from './large-block-math.svelte';
	export { default as StyledQuote } from './styled-quote.svelte';
	export { default as QuoteAttribution } from './quote-attribution.svelte';
	export { default as Caption } from './caption.svelte';
	export { default as Steps } from './steps.svelte';
	export { default as Step } from './step.svelte';
	export { default as ImageGrid } from './image-grid.svelte';
	export { default as ImageGridItem } from './image-grid-item.svelte';
	export { default as FullBleed } from './full-bleed.svelte';
	export { default as LinkedCard } from './linked-card.svelte';
	export { default as DemoBoundary } from './demo-boundary.svelte';
</script>

<script lang="ts">
	// Frontmatter arrives as props, so anything the author writes is available here.
	let {
		children,
		title,
		description
	}: { children: import('svelte').Snippet; title?: string; description?: string } = $props();
</script>

<article class="prose-editorial mx-auto prose max-w-2xl px-4 py-12 prose-neutral dark:prose-invert">
	{#if title}
		<h1 class="mb-2">{title}</h1>
	{/if}
	{#if description}
		<p class="mt-0 text-muted-foreground">{description}</p>
	{/if}
	{@render children()}
</article>
