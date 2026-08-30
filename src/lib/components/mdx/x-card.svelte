<script lang="ts">
	import { cn } from '$lib/utils';
	import Skeleton from './skeleton.svelte';

	let {
		id,
		caption,
		class: className = ''
	}: {
		id: string;
		caption?: string;
		class?: string;
	} = $props();

	// ponytail: v1 used react-tweet (server-fetches the tweet JSON and renders it
	// itself). No Svelte equivalent exists, so this is X's own embed iframe —
	// fewer moving parts, at the cost of a third-party frame and their styling.
	const src = $derived(
		`https://platform.twitter.com/embed/Tweet.html?id=${encodeURIComponent(id)}&dnt=true`
	);

	const FALLBACK_HEIGHT = 550;

	let loaded = $state(false);
	let height = $state(FALLBACK_HEIGHT);

	/**
	 * The embed reports its measured height over postMessage, but only once its
	 * own scripts run — and not at all if X is blocked or the post is gone. So
	 * the frame is revealed on `load` and sized from the fallback until (and
	 * unless) a measurement arrives; gating display on the message left the card
	 * stuck on the skeleton forever.
	 */
	function onMessage(event: MessageEvent) {
		if (!event.origin.endsWith('twitter.com') && !event.origin.endsWith('x.com')) return;
		const payload = event.data?.['twttr.embed'];
		if (payload?.method !== 'twttr.private.resize') return;
		const measured = payload.params?.[0]?.height;
		if (typeof measured === 'number' && measured > 0) height = measured;
	}
</script>

<svelte:window onmessage={onMessage} />

<figure class={cn('not-prose my-6 w-full', className)}>
	<div class="relative mx-auto w-full" style:height="{height}px">
		{#if !loaded}
			<Skeleton class="absolute inset-0 h-full w-full" />
		{/if}
		<iframe
			title="Post on X"
			{src}
			scrolling="no"
			loading="lazy"
			onload={() => (loaded = true)}
			class={cn(
				'h-full w-full transition-opacity duration-200',
				!loaded && 'pointer-events-none opacity-0'
			)}
		></iframe>
	</div>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>
