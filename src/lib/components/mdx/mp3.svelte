<script lang="ts">
	// ponytail: v1 wrapped react-audio-player; the native element is the whole
	// widget, so there is nothing to wrap here.
	let {
		src,
		controls = true,
		autoplay = false,
		loop = false
	}: { src: string; controls?: boolean; autoplay?: boolean; loop?: boolean } = $props();
</script>

{#if src}
	<div class="media-aside my-6">
		<audio {src} {controls} {autoplay} {loop} preload="metadata" class="w-full"></audio>
	</div>
{/if}
