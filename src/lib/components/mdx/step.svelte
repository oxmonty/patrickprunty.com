<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } =
		$props();
</script>

<div
	class={cn(
		'mt-8 scroll-m-32 [counter-increment:step]',
		'before:absolute before:mt-1 before:-ml-[50px] before:inline-flex before:size-8 before:items-center before:justify-center',
		'before:before:border-4 before:border-background before:bg-muted before:text-center',
		'before:-indent-px before:font-mono before:text-base before:font-medium before:text-muted-foreground',
		'before:content-[counter(step)]',
		className
	)}
>
	{@render children()}
</div>
