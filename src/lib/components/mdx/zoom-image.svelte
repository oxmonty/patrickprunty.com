<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		src,
		alt = '',
		caption,
		class: className = ''
	}: { src: string; alt?: string; caption?: string; class?: string } = $props();

	// ponytail: v1 used the `cambio` React lib for the zoom transition. Native
	// <dialog> gives the modal, focus trap, and Esc-to-close for free; swap in a
	// motion library only if the shared-element animation is worth a dependency.
	let dialog = $state<HTMLDialogElement | null>(null);
</script>

<figure class="media-aside not-prose my-6">
	<button
		type="button"
		class="block w-full cursor-zoom-in"
		onclick={() => dialog?.showModal()}
		aria-label={alt ? `Enlarge: ${alt}` : 'Enlarge image'}
	>
		<img {src} {alt} loading="lazy" class={cn('h-auto w-full ', className)} />
	</button>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>

<dialog
	bind:this={dialog}
	onclick={() => dialog?.close()}
	class="m-auto max-h-[90dvh] max-w-[95vw] bg-transparent backdrop:bg-black/80"
>
	<img {src} {alt} class="max-h-[90dvh] max-w-[95vw] cursor-zoom-out object-contain" />
</dialog>
