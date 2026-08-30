<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		wide = false,
		class: className = '',
		children
	}: {
		/** Also bleed on desktop, where media otherwise sits in the text column. */
		wide?: boolean;
		class?: string;
		children: import('svelte').Snippet;
	} = $props();

	let container = $state<HTMLDivElement | null>(null);
	let landscape = $state(false);

	/**
	 * Only landscape media earns the bleed. A portrait image run to the viewport
	 * edge is taller than the screen it is on, so the reader loses the whole post
	 * behind one picture.
	 *
	 * Measured from the media rather than declared by the author, so it cannot go
	 * stale when the image behind a post is swapped.
	 */
	function measure() {
		const media = container?.querySelector('img, video');
		if (!media) return;

		const [width, height] =
			media instanceof HTMLVideoElement
				? [media.videoWidth, media.videoHeight]
				: [(media as HTMLImageElement).naturalWidth, (media as HTMLImageElement).naturalHeight];

		if (width && height) landscape = width > height;
	}

	$effect(() => {
		if (!container) return;

		// Runs now for anything already decoded from cache, and again on arrival.
		// Capture phase because `load` does not bubble.
		measure();
		container.addEventListener('load', measure, true);
		container.addEventListener('loadedmetadata', measure, true);

		return () => {
			container?.removeEventListener('load', measure, true);
			container?.removeEventListener('loadedmetadata', measure, true);
		};
	});
</script>

<!--
	Children render once: the old version duplicated them behind md:hidden /
	hidden md:block, which loaded every image and mounted every player twice.
	`full-bleed` only sizes the media; `full-bleed-on` is what actually bleeds,
	and it waits until the media is known to be landscape.
-->
<div
	bind:this={container}
	class={cn('full-bleed', landscape && 'full-bleed-on', wide && 'full-bleed-wide', className)}
>
	{@render children()}
</div>
