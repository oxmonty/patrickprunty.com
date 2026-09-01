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

	let wrapper = $state<HTMLDivElement | null>(null);
	let video = $state<HTMLVideoElement | null>(null);

	/** Near the viewport. The video carries no `src` before this, so it costs nothing offscreen. */
	let armed = $state(false);
	/** The video has something paintable. */
	let framed = $state(false);
	let started = $state(false);
	/** Measured from the video's own metadata; only consulted when `aspect` is unset. */
	let measured = $state<number | undefined>(undefined);

	const ratio = $derived(aspect ?? measured ?? 16 / 9);
	// A poster paints by itself, so the skeleton can go before any video byte lands.
	const ready = $derived(Boolean(poster) || framed);
	// With a poster nothing is fetched until play; without one the first frame is
	// the thumbnail, and that needs the container metadata.
	const preload = $derived(poster && !autoplay ? 'none' : 'metadata');

	// A `#t=` media fragment makes browsers seek to and paint a real frame rather
	// than leaving the box blank. An explicit `poster` still takes precedence.
	const videoSrc = $derived(src.includes('#t=') ? src : `${src}#t=0.1`);

	$effect(() => {
		if (autoplay) {
			armed = true;
			return;
		}
		if (!wrapper) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					armed = true;
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(wrapper);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!video || !armed) return;
		// The element can already hold data by the time this runs (cached video, or
		// hydration landing after the events fired) and no further event is coming.
		if (video.readyState >= 1) framed = true;
		// `preload` is only a hint: Safari in low power mode, and any browser with
		// data saving on, may fetch nothing at all and fire no media event. Reveal
		// the video regardless rather than leave a skeleton pulsing forever.
		const fallback = setTimeout(() => (framed = true), 3000);
		return () => clearTimeout(fallback);
	});

	function onLoadedMetadata() {
		if (video && video.videoWidth > 0) {
			measured = video.videoWidth / video.videoHeight;
		}
		framed = true;
	}

	function play() {
		started = true;
		// Rejects when the browser declines; the poster frame stays up, which is
		// the graceful state.
		video?.play().catch(() => {});
	}
</script>

{#if src}
	<div
		bind:this={wrapper}
		class="not-prose relative my-6 w-full overflow-hidden"
		style:aspect-ratio={String(ratio ?? 16 / 9)}
	>
		{#if !ready}
			<Skeleton class="pointer-events-none absolute inset-0 h-full w-full" />
		{/if}
		<video
			bind:this={video}
			src={armed ? videoSrc : undefined}
			controls={controls && started}
			{autoplay}
			{loop}
			{muted}
			{poster}
			{preload}
			playsinline
			onloadedmetadata={onLoadedMetadata}
			onloadeddata={() => (framed = true)}
			onerror={() => (framed = true)}
			onplay={() => (started = true)}
			class={cn(
				'absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-out',
				!ready && 'opacity-0',
				className
			)}
		></video>

		{#if ready && !started && !autoplay}
			<button
				type="button"
				onclick={play}
				aria-label="Play video"
				class="absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center bg-black/10 transition-colors hover:bg-black/20"
			>
				<span
					class="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
				>
					<svg viewBox="0 0 24 24" fill="currentColor" class="ml-1 h-7 w-7" aria-hidden="true">
						<path d="M8 5v14l11-7z" />
					</svg>
				</span>
			</button>
		{/if}
	</div>
{/if}
