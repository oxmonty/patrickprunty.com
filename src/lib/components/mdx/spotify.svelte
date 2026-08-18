<script lang="ts">
	import { cn } from '$lib/utils';

	type SpotifyEmbedType = 'track' | 'playlist' | 'album' | 'episode' | 'show';

	let {
		id,
		type,
		width = '100%',
		height,
		class: className = ''
	}: {
		id: string;
		type?: SpotifyEmbedType;
		width?: string | number;
		height?: string | number;
		class?: string;
	} = $props();

	// Playlist ids run longer than track ids and commonly start 37/5.
	const resolvedType = $derived<SpotifyEmbedType>(
		type ?? (id.length > 22 || id.startsWith('37') || id.startsWith('5') ? 'playlist' : 'track')
	);

	const resolvedHeight = $derived(
		height ?? (resolvedType === 'track' || resolvedType === 'episode' ? 152 : 380)
	);

	const src = $derived(`https://open.spotify.com/embed/${resolvedType}/${id}?utm_source=generator`);

	let loaded = $state(false);
</script>

<div
	class={cn('media-aside not-prose relative my-6', className)}
	style:width={typeof width === 'number' ? `${width}px` : width}
	style:height={typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight}
>
	<iframe
		title="Spotify {resolvedType}"
		{src}
		width="100%"
		height="100%"
		allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		loading="lazy"
		class={cn(
			'relative z-2 transition-opacity duration-300',
			!loaded && 'pointer-events-none opacity-0'
		)}
		onload={() => (loaded = true)}
	></iframe>
	{#if !loaded}
		<div class="absolute inset-0 z-1 animate-pulse bg-muted"></div>
	{/if}
</div>
