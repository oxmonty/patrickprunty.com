<script lang="ts">
	import { cn } from '$lib/utils';
	import Skeleton from './skeleton.svelte';

	let {
		videoId,
		class: className = '',
		autoplay = false
	}: { videoId: string; class?: string; autoplay?: boolean } = $props();

	let loaded = $state(false);

	const src = $derived.by(() => {
		const params = new URLSearchParams({
			rel: '0',
			modestbranding: '1',
			controls: '1',
			playsinline: '1',
			...(autoplay ? { autoplay: '1', mute: '1' } : {})
		});
		return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
	});
</script>

<div
	class={cn('media-aside not-prose relative my-6 aspect-video w-full overflow-hidden', className)}
>
	{#if !loaded}
		<Skeleton class="pointer-events-none absolute inset-0 h-full w-full" />
	{/if}
	<iframe
		title="YouTube video"
		{src}
		class={cn(
			'absolute inset-0 h-full w-full transition-opacity duration-200 ease-out',
			!loaded && 'opacity-0'
		)}
		loading="lazy"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		allowfullscreen
		onload={() => (loaded = true)}
	></iframe>
</div>
