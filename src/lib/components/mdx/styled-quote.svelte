<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		href,
		class: className = '',
		children
	}: { href?: string; class?: string; children: import('svelte').Snippet } = $props();
</script>

{#snippet quote()}
	<div
		class={cn(
			'relative mx-auto my-6 block w-full max-w-4xl border-l-4 border-muted-foreground pl-6 text-muted-foreground md:pl-8',
			'[&_p]:!inline [&_p]:!font-serif [&_p]:!text-xl [&_p]:!leading-[1.4]',
			className
		)}
	>
		<span class="relative block font-serif text-xl leading-[1.4] text-muted-foreground">
			<span class="absolute left-[-16px] font-[Georgia] text-muted-foreground md:left-[-20px]"
				>&ldquo;</span
			>
			<span class="inline">{@render children()}</span>
			<span class="inline font-[Georgia] text-muted-foreground">&rdquo;</span>
		</span>
	</div>
{/snippet}

{#if href}
	<a {href} target="_blank" rel="noopener noreferrer" class="no-underline">{@render quote()}</a>
{:else}
	{@render quote()}
{/if}
