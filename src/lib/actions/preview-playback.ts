import type { Action } from 'svelte/action';

/**
 * Playback policy for project preview videos.
 *
 * Touch devices autoplay, since there is no hover there and a paused tile would
 * simply never move. Pointer devices play on hover instead, so a page of
 * previews does not decode several videos just to move in the background.
 *
 * Playback is driven from here rather than the `autoplay` attribute, so the
 * pointer case never plays a frame before being told to stop. `muted` is what
 * makes programmatic `play()` permitted without a user gesture.
 */
export const previewPlayback: Action<HTMLVideoElement> = (node) => {
	const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	// play() rejects when the browser declines (backgrounded tab, power saving).
	// Nothing to recover: the poster frame stays up, which is the graceful state.
	const play = () => void node.play().catch(() => {});

	const rewind = () => {
		node.pause();
		node.currentTime = 0;
	};

	function apply() {
		if (reducedMotion.matches || canHover.matches) rewind();
		else play();
	}

	node.addEventListener('mouseenter', play);
	node.addEventListener('mouseleave', rewind);
	canHover.addEventListener('change', apply);
	reducedMotion.addEventListener('change', apply);
	apply();

	return {
		destroy() {
			node.removeEventListener('mouseenter', play);
			node.removeEventListener('mouseleave', rewind);
			canHover.removeEventListener('change', apply);
			reducedMotion.removeEventListener('change', apply);
		}
	};
};
