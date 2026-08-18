<script lang="ts">
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	let {
		math,
		block = false,
		size
	}: {
		math: string;
		block?: boolean;
		size?: 'small' | 'medium' | 'large' | 'x-large';
	} = $props();

	const scales = { small: 1, medium: 1.2, large: 1.5, 'x-large': 2 };

	// Inline math matches the surrounding paragraph by default; block math stays
	// a touch larger. An explicit `size` overrides both.
	const scale = $derived(size ? scales[size] : block ? 1.2 : 1);

	const html = $derived(katex.renderToString(math, { displayMode: block, throwOnError: false }));
</script>

<!--
	KaTeX output is HTML by design. The source is the author's own markdown, not
	anything a visitor supplies, so there is no untrusted input to sanitise.
-->
{#if block}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div style:font-size="{scale}em">{@html html}</div>
{:else}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<span style:font-size="{scale}em">{@html html}</span>
{/if}
