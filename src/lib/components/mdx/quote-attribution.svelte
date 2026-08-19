<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		author,
		source,
		class: className = ''
	}: { author: string; source?: string; class?: string } = $props();
</script>

<div
	class={cn(
		'-mt-2 ml-auto flex w-full items-center gap-2 text-muted-foreground md:w-[60%]',
		className
	)}
>
	<div class="hidden h-px flex-grow bg-muted-foreground/30 md:block"></div>
	<div class="flex flex-col text-muted-foreground md:ml-auto md:text-right">
		<span class="text-sm leading-tight font-normal whitespace-nowrap">
			{author}{#if source}<span class="mt-1 block text-muted-foreground md:mt-0 md:inline"
					><span class="hidden md:inline-block">, </span>{source}</span
				>{/if}
		</span>
	</div>
</div>
