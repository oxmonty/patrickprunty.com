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
	let thumb = $state<HTMLImageElement | null>(null);

	/**
	 * The enlarged view sizes from the image's own ratio, so it is read off the
	 * thumbnail — same src, already on the page, so the number is known before
	 * the dialog is ever opened.
	 */
	let ratio = $state(1);

	$effect(() => {
		const node = thumb;
		if (!node) return;

		const measure = () => {
			if (node.naturalWidth && node.naturalHeight) ratio = node.naturalWidth / node.naturalHeight;
		};

		// Now for anything already decoded from cache, and again on arrival.
		measure();
		node.addEventListener('load', measure);
		return () => node.removeEventListener('load', measure);
	});

	/**
	 * Reparented to <body> before it can ever open.
	 *
	 * The markup position is inside .editorial, which is `overflow-x: clip` so
	 * the aside figures cannot scroll the page sideways. Promoting a dialog to
	 * the top layer from inside a clipped subtree leaves WebKit painting the
	 * backdrop after close — dark bands down both page edges on iOS. From <body>
	 * there is no clipped ancestor and nothing to leave behind.
	 */
	$effect(() => {
		const node = dialog;
		if (!node) return;

		document.body.appendChild(node);
		return () => node.remove();
	});
</script>

<figure class="not-prose my-6">
	<button
		type="button"
		class="block w-full cursor-zoom-in"
		onclick={() => dialog?.showModal()}
		aria-label={alt ? `Enlarge: ${alt}` : 'Enlarge image'}
	>
		<img bind:this={thumb} {src} {alt} loading="lazy" class={cn('h-auto w-full ', className)} />
	</button>
	{#if caption}
		<figcaption class="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>
	{/if}
</figure>

<!--
	The UA stylesheet caps a dialog at roughly the viewport minus its own padding
	and border, so those three are cleared here or the image can never reach the
	edge. Sizing is left to the image itself.

	`w-fit`, not `w-auto`: the UA centres a dialog with `inset-inline: 0` plus
	`margin: auto`, which only works against a shrink-to-fit width. `auto` there
	stretches the box across the viewport and leaves the image on its left edge.
-->
<dialog
	bind:this={dialog}
	onclick={() => dialog?.close()}
	aria-label={alt
		? `${alt} (enlarged). Press Escape to close.`
		: 'Enlarged image. Press Escape to close.'}
	style:--zoom-ratio={ratio}
	class="zoom-dialog m-auto max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-black/80 md:w-fit"
>
	<img {src} {alt} class="zoom-image cursor-zoom-out" />
</dialog>

<style>
	/*
	 * Phone: the dialog is the full screen width, so the image takes it and lets
	 * its height follow. `contain` keeps a tall photo from running off the bottom
	 * without squashing it, since the width is already fixed at that point.
	 */
	/*
	 * showModal() puts focus on the dialog itself, because nothing inside it is
	 * focusable. The browser then rings it, which draws a box around the picture
	 * — the one thing the reader opened it to look at. The backdrop already says
	 * where focus is, and Escape or a tap anywhere closes it, so the ring is
	 * telling them nothing they cannot see.
	 */
	.zoom-dialog:focus {
		outline: none;
	}

	.zoom-image {
		display: block;
		width: 100%;
		height: auto;
		max-height: 100dvh;
		object-fit: contain;
		user-select: none;
	}

	/*
	 * Desktop: scale to the viewport and touch whichever edge binds first — a
	 * landscape photo meets the top and bottom, a portrait one meets the sides.
	 *
	 * `min()` does the choosing: 100vh × ratio is the width the image would need
	 * to stand full height, so it wins while it fits, and 100vw takes over once
	 * it does not. `height: auto` then follows the image's own ratio, which keeps
	 * the element box exactly the size of the pixels drawn in it.
	 *
	 * lvh, not dvh: the modal does not scroll, and dvh would resize it every time
	 * a mobile URL bar animates.
	 */
	@media screen and (min-width: 768px) {
		.zoom-image {
			width: min(100vw, calc(100lvh * var(--zoom-ratio, 1)));
			max-width: 100vw;
			max-height: 100lvh;
		}
	}
</style>
