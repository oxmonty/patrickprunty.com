<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		columns = 2,
		gap = 'md',
		class: className = '',
		children
	}: {
		columns?: 1 | 2 | 3;
		gap?: 'sm' | 'md' | 'lg';
		class?: string;
		children: import('svelte').Snippet;
	} = $props();

	const gaps = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' };
	const cols = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-3'
	};
</script>

<div
	class={cn(
		'not-prose relative my-8 block w-full md:left-1/2 md:my-16 md:w-screen md:max-w-[1100px] md:-translate-x-1/2',
		className
	)}
>
	<div class={cn('grid', cols[columns], gaps[gap])}>{@render children()}</div>
</div>
