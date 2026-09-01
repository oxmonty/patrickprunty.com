<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		src,
		controls = true,
		autoplay = false,
		loop = false,
		muted = false,
		poster,
		width,
		height,
		class: className = ''
	}: {
		src: string;
		controls?: boolean;
		autoplay?: boolean;
		loop?: boolean;
		muted?: boolean;
		poster?: string;
		/**
		 * The video's own pixel dimensions. Given both, the browser knows the box's
		 * shape before it has loaded anything, which is what stops the element
		 * collapsing to its default size between the poster and the first frame.
		 */
		width?: number;
		height?: number;
		class?: string;
	} = $props();

	// With a poster there is nothing to fetch until the user presses play. Without
	// one, a `#t=` media fragment has the browser paint that frame as the
	// thumbnail, which needs the metadata and no more.
	const wantsPoster = $derived(Boolean(poster) && !autoplay);
	const preload = $derived(wantsPoster ? 'none' : 'metadata');
	const videoSrc = $derived(wantsPoster || src.includes('#t=') ? src : `${src}#t=0.1`);
</script>

{#if src}
	<!--
		Sized by the video's own intrinsic ratio rather than a box we impose, so
		nothing letterboxes. `controls` is the play button; the poster is the
		thumbnail. preload="none" is what keeps it off the wire until it is wanted.
	-->
	<video
		src={videoSrc}
		{controls}
		{autoplay}
		{loop}
		{muted}
		{poster}
		{preload}
		{width}
		{height}
		playsinline
		class={cn('not-prose my-6 block h-auto w-full', className)}
	></video>
{/if}
