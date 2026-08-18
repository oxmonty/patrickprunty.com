<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		onlyMobile = false,
		class: className = '',
		children
	}: { onlyMobile?: boolean; class?: string; children: import('svelte').Snippet } = $props();

	/** Breaks out of the prose column to the full viewport width. */
	const bleed = 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none';
</script>

{#if onlyMobile}
	<div class={cn(bleed, 'md:hidden', className)}>
		<div class="mx-auto max-w-6xl">{@render children()}</div>
	</div>
	<div class="hidden md:block">{@render children()}</div>
{:else}
	<div class={cn(bleed, className)}>
		<div class="mx-auto max-w-6xl">{@render children()}</div>
	</div>
{/if}
