import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Defers `task` until the browser has nothing better to do, and returns the
 * canceller so an `$effect` can hand it straight back as cleanup.
 *
 * For work that only feeds the footer: firing it from a bare `$effect` puts the
 * request on the critical path at hydration, where it competes with the chunks
 * the page actually needs to render.
 *
 * The timeout is the floor, not the target — an idle moment may never come on a
 * busy page, and these requests still have to land. `setTimeout` covers the
 * Safari versions that never shipped requestIdleCallback.
 */
export function runWhenIdle(task: () => void): () => void {
	if (typeof requestIdleCallback === 'function') {
		const handle = requestIdleCallback(task, { timeout: 3000 });
		return () => cancelIdleCallback(handle);
	}

	const handle = setTimeout(task, 200);
	return () => clearTimeout(handle);
}
