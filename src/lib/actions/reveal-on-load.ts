import type { Action } from 'svelte/action';

/**
 * Fades preview media in once it can actually be shown, instead of having it
 * pop in at full opacity.
 *
 * Images reveal on their own `load` event — or immediately when the browser
 * already has them cached, which `complete` reports. Videos reveal on mount:
 * `preload="none"` means no media event is guaranteed to fire until playback
 * starts, so waiting on one could leave the tile invisible indefinitely. The
 * poster frame paints regardless, which is what the fade is covering.
 *
 * `error` also reveals, so a broken source shows its alt text rather than
 * silently staying at zero opacity.
 */
export const revealOnLoad: Action<HTMLImageElement | HTMLVideoElement> = (node) => {
	const reveal = () => node.classList.add('is-loaded');

	if (node instanceof HTMLImageElement) {
		if (node.complete) {
			reveal();
		} else {
			node.addEventListener('load', reveal, { once: true });
			node.addEventListener('error', reveal, { once: true });
		}
	} else {
		// Next frame, so the transition has a starting value to animate from.
		requestAnimationFrame(reveal);
	}

	return {
		destroy() {
			node.removeEventListener('load', reveal);
			node.removeEventListener('error', reveal);
		}
	};
};
