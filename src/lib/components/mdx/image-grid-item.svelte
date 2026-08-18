<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		src,
		alt = '',
		caption,
		class: className = ''
	}: { src: string; alt?: string; caption?: string; class?: string } = $props();
</script>

<figure class={cn('m-0', className)}>
	<img {src} {alt} loading="lazy" class="h-full w-full object-cover" />
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>
