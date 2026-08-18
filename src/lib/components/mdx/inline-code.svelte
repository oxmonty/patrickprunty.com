<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } =
		$props();
</script>

<!--
	base-ui-style inline code, matching monthy/www: no pill, blue accent. `not-prose`
	is what strips Tailwind Typography's literal backtick ::before/::after and its
	600 weight, which is why inline code read as bold text in backticks before.
-->
<code
	class={cn(
		'not-prose rounded-none bg-[var(--code-bg)] px-1 py-0.5 font-mono text-[0.85em] tracking-[-0.01em] text-[var(--code-fg)] [word-spacing:-0.2em]',
		className
	)}>{@render children()}</code
>
