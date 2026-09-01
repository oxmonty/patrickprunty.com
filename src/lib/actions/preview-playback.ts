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

	let inView = false;

	// play() rejects when the browser declines (backgrounded tab, power saving).
	// Nothing to recover: the poster frame stays up, which is the graceful state.
	const play = () => void node.play().catch(() => {});

	const rewind = () => {
		node.pause();
		node.currentTime = 0;
	};

	function apply() {
		if (reducedMotion.matches || canHover.matches || !inView) rewind();
		else play();
	}

	// play() overrides preload="none", so without this the touch branch fetches
	// every tile's video the moment the page mounts, whatever is on screen.
	const observer = new IntersectionObserver(
		(entries) => {
			inView = entries.some((entry) => entry.isIntersecting);
			apply();
		},
		{ rootMargin: '100px' }
	);
	observer.observe(node);

	node.addEventListener('mouseenter', play);
	node.addEventListener('mouseleave', rewind);
	canHover.addEventListener('change', apply);
	reducedMotion.addEventListener('change', apply);

	return {
		destroy() {
			observer.disconnect();
			node.removeEventListener('mouseenter', play);
			node.removeEventListener('mouseleave', rewind);
			canHover.removeEventListener('change', apply);
			reducedMotion.removeEventListener('change', apply);
		}
	};
};
