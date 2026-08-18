<script lang="ts">
	import { cn } from '$lib/utils';

	/**
	 * Severity is carried by the background wash, the way staydecent's .note
	 * reads — no icon, no border. The two inverted variants also set a text
	 * colour, since ink on near-black or paper on acid green would not hold.
	 */
	const variants = {
		note: 'bg-[var(--note)]',
		info: 'bg-[var(--note-info)]',
		success: 'bg-[var(--note-success)]',
		warning: 'bg-[var(--note-warning)]',
		caution: 'bg-[var(--note-caution)]',
		danger: 'bg-[var(--note-danger)]',
		inverse: 'bg-[var(--ink)] text-[var(--paper)]',
		highlight: 'bg-[var(--highlight)] text-[var(--ink)]'
	} as const;

	let {
		type = 'note',
		class: className = '',
		children
	}: {
		type?: keyof typeof variants;
		class?: string;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class={cn('my-6 p-4', variants[type], className)}>
	{@render children()}
</div>
