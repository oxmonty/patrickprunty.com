<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		href,
		class: className = '',
		children
	}: { href: string; class?: string; children: import('svelte').Snippet } = $props();
</script>

<a
	{href}
	class={cn(
		'flex w-full flex-col items-center border border-border bg-background p-6 text-foreground no-underline shadow-sm transition-colors hover:bg-muted/50 sm:p-10',
		className
	)}
>
	{@render children()}
</a>
