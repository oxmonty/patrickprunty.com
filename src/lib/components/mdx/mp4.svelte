<script lang="ts">
	import { cn } from '$lib/utils';
	import Skeleton from './skeleton.svelte';

	let {
		src,
		controls = true,
		autoplay = false,
		loop = false,
		muted = false,
		poster,
		aspect,
		class: className = ''
	}: {
		src: string;
		controls?: boolean;
		autoplay?: boolean;
		loop?: boolean;
		muted?: boolean;
		poster?: string;
		/**
		 * CSS `aspect-ratio` for the reserved box (e.g. `16 / 9`). Prevents layout
		 * shift before the video's own dimensions are known. When omitted, the box
		 * is reserved from the video's metadata, 16/9 until then.
		 */
		aspect?: number | string;
		class?: string;
	} = $props();

	let video = $state<HTMLVideoElement | null>(null);
	let loaded = $state(false);
	/** Measured from the video's own metadata; only consulted when `aspect` is unset. */
	let measured = $state<number | undefined>(undefined);

	const ratio = $derived(aspect ?? measured ?? 16 / 9);

	// A `#t=` media fragment makes mobile Safari render that frame as the poster,
	// so the video shows a thumbnail instead of a blank play button. An explicit
	// `poster` still takes precedence.
	const videoSrc = $derived(src.includes('#t=') ? src : `${src}#t=0.1`);

	function onLoadedMetadata() {
		if (video && video.videoWidth > 0) {
			measured = video.videoWidth / video.videoHeight;
		}
		// Mobile Safari with preload="metadata" won't decode the first frame until
		// the user taps play, so reveal on metadata to keep the skeleton from
		// lingering. The video shows its native poster then.
		loaded = true;
	}
</script>

{#if src}
	<div
		class="not-prose relative my-6 w-full overflow-hidden"
		style:aspect-ratio={String(ratio ?? 16 / 9)}
	>
		{#if !loaded}
			<Skeleton class="pointer-events-none absolute inset-0 h-full w-full" />
		{/if}
		<video
			bind:this={video}
			src={videoSrc}
			{controls}
			{autoplay}
			{loop}
			{muted}
			{poster}
			playsinline
			preload="metadata"
			onloadedmetadata={onLoadedMetadata}
			onloadeddata={() => (loaded = true)}
			onerror={() => (loaded = true)}
			class={cn(
				'absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-out',
				!loaded && 'opacity-0',
				className
			)}
		></video>
	</div>
{/if}
